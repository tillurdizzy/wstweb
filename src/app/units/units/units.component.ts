import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SupabaseService } from '../../services/supabase.service';
import { UnitService } from '../../services/unit.service';
import { ActivatedRoute } from '@angular/router';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    SelectModule,
    ButtonModule,
    FormsModule,
    RouterModule,
    MessageModule,
    FluidModule,
  ],
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
})
export class UnitsComponent implements OnInit, OnChanges {
  @Input() ownerIdInput: string | null = null;
  @Input() unitInput: number | null = null;

  units: any[] = [];
  selectedUnit: number | null = null;
  residents: any[] = [];
  vehicles: any[] = [];
  owner: any = null;
  ownerOccupied: boolean = false;
  isAdmin: boolean = false;
  ownerConfirmed: boolean = false;
  ownerHasAuth: boolean = false;
  residentsStatus: 'green' | 'red' | 'yellow' = 'red';
  vehiclesStatus: 'green' | 'red' | 'yellow' = 'red';
  private ready = false;

  proxy: string | null = null;
  notes = '';
  savingElection = false;
  electionMessage = '';
  contactType: string | null = null;
  contactNote = '';
  contactHistory = '';
  savingContact = false;
  contactMessage = '';
  signedInEmail = '';
  contactChoices = [
  'Try again later',
  'FOR Us - Vote in person',
  'FOR Us - Proxy promised',
  'Proxy collected',
  'AGAINST Us',
  'Reset',
  ];
contactChoice: string | null = null;


  constructor(
    private supabaseService: SupabaseService,
    private unitService: UnitService,
    private route: ActivatedRoute
  ) {}



  async ngOnInit() {
    this.isAdmin = await this.supabaseService.isAdmin();
    
    this.ready = true;
    await this.load();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.ready) return;
    if (changes['ownerIdInput'] || changes['unitInput']) {
      this.load();
    }
  }

  private async load() {
    const unitParam = this.unitInput != null
      ? String(this.unitInput)
      : this.route.snapshot.queryParamMap.get('unit');
    const ownerIdParam = this.ownerIdInput || this.route.snapshot.queryParamMap.get('ownerId');
    const { data: user } = await this.supabaseService.getUser();

    if (!user?.user) return;
    this.signedInEmail = user.user.email || '';
    let ownerId: string | null = null;

    if (unitParam && this.isAdmin && !ownerIdParam) {
      const { data: unitOwners, error: unitError } = await this.supabaseService.client
        .from('unit_owners')
        .select('owner_id')
        .eq('unit', Number(unitParam));
      if (unitError || !unitOwners || unitOwners.length === 0) {
        console.error('Error fetching unit owner:', unitError?.message);
        return;
      }
      ownerId = unitOwners[0].owner_id;
    } else if (ownerIdParam && this.isAdmin) {
      ownerId = ownerIdParam;
    } else {
      const { data: ownerRow } = await this.supabaseService.client
        .from('owners')
        .select('owner_id')
        .eq('uuid', user.user.id)
        .single();
      ownerId = ownerRow?.owner_id || null;
    }

    if (!ownerId) return;

    const { data: ownerData, error: ownerError } = await this.supabaseService.client
      .from('owners')
      .select('owner_id, firstname, lastname, cell, email, data_confirmed, uuid')
      .eq('owner_id', ownerId)
      .single();
    if (ownerError) {
      console.error('Error fetching owner:', ownerError.message);
      return;
    }

    this.owner = ownerData;
    this.ownerConfirmed = !!ownerData.data_confirmed;
    this.ownerHasAuth = !!ownerData.uuid;

    const { data, error } = await this.supabaseService.client
      .from('unit_owners')
      .select('unit, units!inner(unit, owner_occupied)')
      .eq('owner_id', ownerId);
    if (error) {
      console.error('Error fetching units:', error.message);
    } else {
      this.units = (data || []).map((uo: any) => ({
        unit: uo.units.unit,
        owner_occupied: !!uo.units.owner_occupied,
      }));
    }

    if (this.units.length > 0) {
      const requested = unitParam ? Number(unitParam) : null;
      const match = requested ? this.units.find((u) => u.unit === requested) : null;
      this.selectedUnit = match ? match.unit : this.units[0].unit;
      this.applyOccupancy(this.selectedUnit);
      this.unitService.setSelectedUnit(this.selectedUnit);
      if (this.selectedUnit !== null) {
        await this.loadUnitDetails(this.selectedUnit);
      }
    }
  }

  private applyOccupancy(unit: number | null) {
    const row = this.units.find((u) => u.unit === unit);
    this.ownerOccupied = !!row?.owner_occupied;
  }

  async loadUnitDetails(unit: number | null) {
    this.applyOccupancy(unit);

    const { data: resData, error: resError } = await this.supabaseService.client
      .from('residents')
      .select('id, firstname, lastname, cell, email, data_confirmed')
      .eq('unit', unit);
    if (resError) {
      console.error('Error fetching residents:', resError.message);
    } else {
      this.residents = resData || [];
    }

    const { data: vehData, error: vehError } = await this.supabaseService.client
      .from('parking')
      .select('id, make, model, color, tag, data_confirmed')
      .eq('unit', unit);
    if (vehError) {
      console.error('Error fetching vehicles:', vehError.message);
    } else {
      this.vehicles = vehData || [];
    }

    this.residentsStatus = this.residentsSectionStatus();
    this.vehiclesStatus = this.sectionStatus(this.vehicles);
    await this.loadElection(unit);
  }

async loadElection(unit: number | null) {
  this.contactChoice = null;
  this.contactNote = '';
  this.contactHistory = '';
  this.contactMessage = '';
  if (unit == null) return;

  const { data, error } = await this.supabaseService.client
    .from('election')
    .select('vote, proxy, notes')
    .eq('unit', unit)
    .maybeSingle();
  if (error) {
    console.error('Error fetching election note:', error.message);
    return;
  }
  if (!data) return;
  this.contactHistory = data.notes || '';
  this.contactChoice = this.choiceFromRow(data.vote, data.proxy);
}

private choiceFromRow(vote: string | null, proxy: string | null): string | null {
  if (proxy === 'Collected') return 'Proxy collected';
  if (proxy === 'Promised') return 'FOR Us - Proxy promised';
  if (vote === 'FOR') return 'FOR Us - Vote in person';
  if (vote === 'AGAINST') return 'AGAINST Us';
  return null;
}

private voteProxyFor(choice: string | null): { vote: string | null; proxy: string | null } {
  switch (choice) {
    case 'FOR Us - Vote in person':
      return { vote: 'FOR', proxy: 'NA' };
    case 'FOR Us - Proxy promised':
      return { vote: 'FOR', proxy: 'Promised' };
    case 'Proxy collected':
      return { vote: 'FOR', proxy: 'Collected' };
    case 'AGAINST Us':
      return { vote: 'AGAINST', proxy: null };
    case 'Reset':
      return { vote: null, proxy: null };
    default:
      return { vote: null, proxy: null };
  }
}


async saveContact() {
  if (this.selectedUnit == null) return;
  const note = (this.contactNote || '').trim();
  if (!this.contactChoice && !note) {
    this.contactMessage = 'Choose a result or enter a note.';
    return;
  }

  this.savingContact = true;
  this.contactMessage = '';

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const what = [this.contactChoice, note].filter(Boolean).join(' — ');
  const block = [
    `Date: ${today}`,
    `User: ${this.signedInEmail || 'unknown'}`,
    `Note: ${what}`,
  ].join('\n');
  const next = this.contactHistory ? `${this.contactHistory}\n\n${block}` : block;

  const patch: any = {
    notes: next,
    owner_id: this.owner?.owner_id || null,
    name: this.owner
      ? `${this.owner.firstname || ''} ${this.owner.lastname || ''}`.trim() || null
      : null,
    email: this.owner?.email || null,
    phone: this.owner?.cell || null,
  };
  if (this.contactChoice && this.contactChoice !== 'Try again later') {
    const { vote, proxy } = this.voteProxyFor(this.contactChoice);
    patch.vote = vote;
    patch.proxy = proxy;
  }

  const { error } = await this.supabaseService.client
    .from('election')
    .update(patch)
    .eq('unit', this.selectedUnit);

  this.savingContact = false;
  if (error) {
    this.contactMessage = error.message;
    return;
  }

  this.contactHistory = next;
  this.contactNote = '';
  if (this.contactChoice === 'Reset') this.contactChoice = null;
  this.contactMessage = 'Saved.';
}



async onOccupiedChange(checked: boolean) {
  if (this.selectedUnit == null) return;
  const previous = this.ownerOccupied;
  this.ownerOccupied = checked;

  const { error } = await this.supabaseService.client
    .from('units')
    .update({ owner_occupied: checked })
    .eq('unit', this.selectedUnit);

  if (error) {
    this.ownerOccupied = previous;
    this.electionMessage = error.message;
    return;
  }

  const row = this.units.find((u) => u.unit === this.selectedUnit);
  if (row) row.owner_occupied = checked;
  this.residentsStatus = this.residentsSectionStatus();
}

  async onUnitChange(event: any) {
    const newUnit = event.value;
    if (newUnit !== null) {
      this.selectedUnit = newUnit;
      this.unitService.setSelectedUnit(this.selectedUnit);
      await this.loadUnitDetails(this.selectedUnit);
    }
  }

  private residentsSectionStatus(): 'green' | 'red' | 'yellow' {
    const flags: boolean[] = this.residents.map((r) => !!r.data_confirmed);
    if (this.ownerOccupied) {
      flags.unshift(this.ownerConfirmed);
    }
    return this.statusFromFlags(flags);
  }

  private sectionStatus(rows: any[]): 'green' | 'red' | 'yellow' {
    return this.statusFromFlags((rows || []).map((r) => !!r.data_confirmed));
  }

  private statusFromFlags(flags: boolean[]): 'green' | 'red' | 'yellow' {
    if (!flags.length) return 'red';
    const confirmed = flags.filter((f) => f).length;
    if (confirmed === flags.length) return 'green';
    if (flags.length > 1 && confirmed > 0 && confirmed < flags.length) return 'yellow';
    return 'red';
  }
}