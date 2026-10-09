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
  voteChoices = ['Yes', 'No', 'Maybe'];
  vote: string | null = null;
  proxy: string | null = null;
  notes = '';
  savingElection = false;
  electionMessage = '';
  contactTypes = ['Face to face', 'email', 'text', 'mail'];
  contactType: string | null = null;
  contactNote = '';
  contactHistory = '';
  savingContact = false;
  contactMessage = '';
  signedInEmail = '';

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
  this.vote = null;
  this.proxy = null;
  this.contactType = null;
  this.contactNote = '';
  this.contactHistory = '';
  this.contactMessage = '';
  this.electionMessage = '';
  if (!this.owner?.owner_id) return;

  const { data, error } = await this.supabaseService.client
    .from('election')
    .select('vote, proxy, notes')
    .eq('owner_id', this.owner.owner_id)
    .limit(1);
  if (error) {
    console.error('Error fetching election note:', error.message);
    return;
  }
  const row = data && data.length ? data[0] : null;
  if (!row) return;
  this.vote = row.vote || null;
  this.proxy = row.proxy || null;
  this.contactHistory = row.notes || '';
}

async saveContact() {
  if (!this.owner?.owner_id) return;
  const note = (this.contactNote || '').trim();
  if (!this.contactType || !note) {
    this.contactMessage = 'Type and notes are required.';
    return;
  }

  this.savingContact = true;
  this.contactMessage = '';

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const block = [
    `Date: ${today}`,
    `User: ${this.signedInEmail || 'unknown'}`,
    `Type: ${this.contactType}`,
    `Note: ${note}`,
  ].join('\n');
  const next = this.contactHistory ? `${this.contactHistory}\n\n${block}` : block;

  const { error } = await this.supabaseService.client
    .from('election')
    .update({ notes: next })
    .eq('owner_id', this.owner.owner_id);

  this.savingContact = false;
  if (error) {
    this.contactMessage = error.message;
    return;
  }

  this.contactHistory = next;
  this.contactType = null;
  this.contactNote = '';
  this.contactMessage = 'Saved.';
}

async saveElection() {
  if (this.selectedUnit == null || !this.owner?.owner_id) return;
  this.savingElection = true;
  this.electionMessage = '';
  const { error } = await this.supabaseService.client
    .from('election')
    .update({
      unit: this.selectedUnit,
      name: `${this.owner.firstname || ''} ${this.owner.lastname || ''}`.trim() || null,
      email: this.owner.email || null,
      phone: this.owner.cell || null,
      vote: this.vote || null,
      proxy: this.proxy || null,
    })
    .eq('owner_id', this.owner.owner_id);
  this.savingElection = false;
  this.electionMessage = error ? error.message : 'Saved.';
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