import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { UnitService } from '../../services/unit.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule,

    FormsModule,

    RouterModule,
  ],
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
})
export class UnitsComponent implements OnInit {
  units: any[] = [];
  selectedUnit: number | null = null;
  residents: any[] = [];
  vehicles: any[] = [];
  owner: any = null;
  ownerOccupied: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private unitService: UnitService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.isAdmin = await this.supabaseService.isAdmin();
    const unitParam = this.route.snapshot.queryParamMap.get('unit');
    const ownerIdParam = this.route.snapshot.queryParamMap.get('ownerId');
    const { data: user } = await this.supabaseService.getUser();

    if (!user?.user) return;

    if (unitParam && this.isAdmin) {
      const { data: unitOwners, error: unitError } = await this.supabaseService.client
        .from('unit_owners')
        .select('owner_id')
        .eq('unit', Number(unitParam));
      if (unitError || !unitOwners || unitOwners.length === 0) {
        console.error('Error fetching unit owner:', unitError?.message);
        return;
      }

      const ownerId = unitOwners[0].owner_id;

      const { data: ownerData, error: ownerError } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, cell, email')
        .eq('owner_id', ownerId)
        .single();
      if (ownerError) {
        console.error('Error fetching owner:', ownerError.message);
      } else {
        this.owner = ownerData;

        const { data: unitData, error: unitDataError } = await this.supabaseService.client
          .from('units')
          .select('unit, owner_occupied')
          .eq('unit', Number(unitParam))
          .single();
        if (unitDataError) {
          console.error('Error fetching unit data:', unitDataError.message);
        } else {
          this.units = [unitData];
          this.ownerOccupied = unitData.owner_occupied;
        }
      }
    } else {
      let ownerQuery = this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, cell, email');

      if (ownerIdParam && this.isAdmin) {
        ownerQuery = ownerQuery.eq('owner_id', ownerIdParam);
      } else {
        ownerQuery = ownerQuery.eq('uuid', user.user.id);
      }

      const owner = await ownerQuery.single();
      if (owner.data) {
        this.owner = owner.data;

        const { data, error } = await this.supabaseService.client
          .from('unit_owners')
          .select('unit, units!inner(unit, owner_occupied)')
          .eq('owner_id', this.owner.owner_id);
        if (error) {
          console.error('Error fetching units:', error.message);
        } else {
          this.units = data.map((uo: any) => uo.units) || [];
        }
      }
    }

    if (this.units.length > 0) {
      this.selectedUnit = this.units[0].unit;
      this.ownerOccupied = this.units[0].owner_occupied;
      this.unitService.setSelectedUnit(this.selectedUnit);
      if (this.selectedUnit !== null) {
        await this.loadUnitDetails(this.selectedUnit);
      }
    }
  }

  async loadUnitDetails(unit: number) {
    const { data: resData, error: resError } = await this.supabaseService.client
      .from('residents')
      .select('id, firstname, lastname, cell, email')
      .eq('unit', unit);
    if (resError) {
      console.error('Error fetching residents:', resError.message);
    } else {
      this.residents = resData || [];
    }

    const { data: vehData, error: vehError } = await this.supabaseService.client
      .from('parking')
      .select('id, make, model, color, tag')
      .eq('unit', unit);
    if (vehError) {
      console.error('Error fetching vehicles:', vehError.message);
    } else {
      this.vehicles = vehData || [];
    }
  }

  async onUnitChange() {
    if (this.selectedUnit !== null) {
      this.unitService.setSelectedUnit(this.selectedUnit);
      await this.loadUnitDetails(this.selectedUnit);
    }
  }
}