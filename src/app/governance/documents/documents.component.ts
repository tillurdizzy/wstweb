import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

export interface DocSection {
  id: string;
  title: string;
  pdf: string;
}

export interface GoverningDoc {
  id: string;
  title: string;
  pdf?: string;
  sections?: DocSection[];
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, CardModule, SafeUrlPipe],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent {
  openDocId: string | null = null;
  openSectionId: string | null = null;

  docs: GoverningDoc[] = [
    {
      id: 'declaration',
      title: 'Condominium Declaration',
      pdf: 'docs/Westbury_Square_Declaration_Recorded_1978.pdf',
    },
    {
      id: 'amendment',
      title: 'Amendment to Declaration',
      pdf: 'docs/Declaration_Amendment.pdf',
    },
    {
      id: 'articles',
      title: 'Articles of Incorporation',
      pdf: 'docs/Westbury_Square_Articles_of_Incorporation.pdf',
    },
    {
      id: 'bylaws',
      title: 'Westbury Square Bylaws',
      sections: [
        { id: 'art-i', title: 'ARTICLE I — DEFINITIONS AND CONSTRUCTION', pdf: 'docs/WST_Bylaws_Article.I.pdf' },
        { id: 'art-ii', title: 'ARTICLE II — PLAN OF OWNERSHIP', pdf: 'docs/WST_Bylaws_Article.II.pdf' },
        { id: 'art-iii', title: 'ARTICLE III — MEMBERSHIP, VOTING, MAJORITY OF OWNERS, QUORUM, PROXIES', pdf: 'docs/WST_Bylaws_Article.III.pdf' },
        { id: 'art-iv', title: 'ARTICLE IV — ADMINISTRATION', pdf: 'docs/WST_Bylaws_Article.IV.pdf' },
        { id: 'art-v', title: 'ARTICLE V — BOARD OF DIRECTORS', pdf: 'docs/WST_Bylaws_Article.V.pdf' },
        { id: 'art-vi', title: 'ARTICLE VI — FISCAL MANAGEMENT', pdf: 'docs/WST_Bylaws_Article.VI.pdf' },
        { id: 'art-vii', title: 'ARTICLE VII — OFFICERS', pdf: 'docs/WST_Bylaws_Article.VII.pdf' },
        { id: 'art-viii', title: 'ARTICLE VIII — INDEMNIFICATION OF OFFICERS, MANAGERS AND MANAGING AGENT', pdf: 'docs/WST_Bylaws_Article.VIII.pdf' },
        { id: 'art-ix', title: 'ARTICLE IX — AMENDMENTS TO BY-LAWS', pdf: 'docs/WST_Bylaws_Article.IX.pdf' },
        { id: 'art-x', title: 'ARTICLE X — MORTGAGES', pdf: 'docs/WST_Bylaws_Article.X.pdf' },
        { id: 'art-xi', title: 'ARTICLE XI — EVIDENCE OF OWNERSHIP, REGISTRATION OF MAILING ADDRESS AND DESIGNATION OF VOTING REPRESENTATIVE', pdf: 'docs/WST_Bylaws_Article.XI.pdf' },
        { id: 'art-xii', title: 'ARTICLE XII — OBLIGATIONS OF THE OWNERS', pdf: 'docs/WST_Bylaws_Article.XII.pdf' },
        { id: 'art-xiii', title: 'ARTICLE XIII — ABATEMENT AND ENJOINMENT OF VIOLATIONS BY UNIT OWNERS', pdf: 'docs/WST_Bylaws_Article.XIII.pdf' },
        { id: 'art-xiv', title: 'ARTICLE XIV — COMMITTEES', pdf: 'docs/WST_Bylaws_Article.XIV.pdf' },
        { id: 'art-xv', title: 'ARTICLE XV — COMPENSATION', pdf: 'docs/WST_Bylaws_Article.XV.pdf' },
        { id: 'art-xvi', title: 'ARTICLE XVI — EXECUTION OF DOCUMENTS', pdf: 'docs/WST_Bylaws_Article.XVI.pdf' },
        { id: 'art-xvii', title: 'ARTICLE XVII — PROXY TO TRUST', pdf: 'docs/WST_Bylaws_Article.XVII.pdf' },
      ],
    },
    {
      id: 'rules',
      title: 'Rules and Regulations',
      pdf: 'docs/RulesAndRegulations.pdf',
    },
    {
      id: 'owner',
      title: 'Owners Responsibility',
      pdf: 'docs/OwnerResponsibilityList.pdf',
    },
  ];

  toggleDoc(doc: GoverningDoc) {
    if (this.openDocId === doc.id) {
      this.openDocId = null;
      this.openSectionId = null;
      return;
    }
    this.openDocId = doc.id;
    this.openSectionId = null;
  }

  toggleSection(sectionId: string) {
    this.openSectionId = this.openSectionId === sectionId ? null : sectionId;
  }
}