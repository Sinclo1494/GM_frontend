import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  AnalyseQuantitativeResumeType,
  AnalyseQuantitativeType,
} from "../types/analyseQuantitative";

import type {
  AnalyseExploitationResumeType,
  AnalyseExploitationType,
} from "../types/analyseExploitation";

const COLORS = {
  primary: [31, 78, 121] as [number, number, number],
  secondary: [221, 235, 247] as [number, number, number],
  light: [248, 249, 250] as [number, number, number],
  border: [220, 220, 220] as [number, number, number],
  text: [55, 55, 55] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function drawHeader(
  pdf: jsPDF,
  title: string,
  filters: {
    filiale: string;
    dateDebut: string;
    dateFin: string;
  },
) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Blue banner
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 24, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(title, 14, 15);

  pdf.setFontSize(10);
  pdf.text(
    `Filiale : ${filters.filiale}    |    Période : ${filters.dateDebut} → ${filters.dateFin}`,
    14,
    31,
  );

  pdf.setDrawColor(...COLORS.border);
  pdf.line(14, 35, pageWidth - 14, 35);

  pdf.setTextColor(...COLORS.text);
}

function drawFooter(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(9);
    pdf.setTextColor(120);

    pdf.text(
      `Generated ${new Date().toLocaleDateString()}`,
      14,
      pageHeight - 8,
    );

    pdf.text(
      `Page ${i} / ${pageCount}`,
      pageWidth - 30,
      pageHeight - 8,
    );
  }
}

export function exportAnalyseQuantitative(
  resume: AnalyseQuantitativeResumeType,
  categories: {
    code_categorie: string;
    title: string;
    rows: AnalyseQuantitativeType[];
  }[],
  filters: {
    filiale: string;
    dateDebut: string;
    dateFin: string;
  },
) {
  const pdf = new jsPDF("landscape");

  drawHeader(pdf, "Analyse Quantitative", filters);

  // Resume Table
  autoTable(pdf, {
    startY: 42,

    head: [[
      "Nombre",
      "Age moyen",

      "Exp.\nService",
      "Exp.\nChômage",
      "Exp.\nPanne",

      "Imm.\nChômage",
      "Imm.\nRéparation",
      "Imm.\nAutre",

      "Rép.\nALREM",
      "Rép.\nAutre",
    ]],

    body: [[
      resume.nombre_totale,
      resume.age_moyen,

      resume.exploitation.en_service,
      resume.exploitation.en_chomage,
      resume.exploitation.en_panne,

      resume.immobilises.en_chomage,
      resume.immobilises.en_reparation,
      resume.immobilises.autre,

      resume.reparation_externe.ALREM,
      resume.reparation_externe.autre,
    ]],

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      textColor: COLORS.text,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 9,
    },

    bodyStyles: {
      fillColor: COLORS.white,
    },

    alternateRowStyles: {
      fillColor: COLORS.light,
    },
  });

  // Category tables
  categories.forEach((category) => {
    pdf.addPage();

    drawHeader(pdf, "Analyse Quantitative", filters);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(...COLORS.primary);

    pdf.text(
      `${category.code_categorie} - ${category.title}`,
      14,
      42,
    );

    autoTable(pdf, {
      startY: 48,

      head: [[
        "Sous famille",

        "Nbr",
        "Age",

        "Service",
        "Chômage",
        "Panne",

        "Imm.\nChômage",
        "Imm.\nRéparation",
        "Imm.\nAutre",

        "ALREM",
        "Autre",
      ]],

      body: category.rows.map((r) => [
        r.libelle_sous_famille,

        r.nbr,
        r.age_moyen,

        r.exploitation.en_service,
        r.exploitation.en_chomage,
        r.exploitation.en_panne,

        r.immobilise.en_chomage,
        r.immobilise.en_reparation,
        r.immobilise.autre,

        r.reparation.ALREM,
        r.reparation.autre,
      ]),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.8,
        lineWidth: 0.2,
        lineColor: COLORS.border,
        textColor: COLORS.text,
        valign: "middle",
      },

      columnStyles: {
        0: {
          cellWidth: 60,
          halign: "left",
          fontStyle: "bold",
        },
      },

      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.primary,
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: COLORS.light,
      },

      bodyStyles: {
        fillColor: COLORS.white,
      },
    });
  });

  drawFooter(pdf);

  pdf.save("Analyse_Quantitative.pdf");
}

export function exportAnalyseExploitation(
  resume: AnalyseExploitationResumeType,
  categories: {
    code_categorie: string;
    title: string;
    rows: AnalyseExploitationType[];
  }[],
  filters: {
    filiale: string;
    dateDebut: string;
    dateFin: string;
  },
) {
  const pdf = new jsPDF("landscape");

  drawHeader(pdf, "Analyse de l'Exploitation du Matériel", filters);

  // ===========================
  // Resume
  // ===========================
  autoTable(pdf, {
    startY: 42,

    head: [[
      "Nombre",
      "Potentiel",
      "Taux location",

      "H. Service",
      "H. Chômage",
      "H. Panne",

      "M. Service",
      "M. Chômage",
      "M. Panne",
    ]],

    body: [[
      resume.nombre_total,
      resume.total_potentiel.toFixed(1),
      resume.taux_location_moyen.toFixed(2),

      `${resume.heures_service.toFixed(1)} (${resume.pct_heures_service.toFixed(1)}%)`,
      `${resume.heures_chomage.toFixed(1)} (${resume.pct_heures_chomage.toFixed(1)}%)`,
      `${resume.heures_panne.toFixed(1)} (${resume.pct_heures_panne.toFixed(1)}%)`,

      `${resume.montant_service.toFixed(2)} (${resume.pct_montant_service.toFixed(1)}%)`,
      `${resume.montant_chomage.toFixed(2)} (${resume.pct_montant_chomage.toFixed(1)}%)`,
      `${resume.montant_panne.toFixed(2)} (${resume.pct_montant_panne.toFixed(1)}%)`,
    ]],

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      textColor: COLORS.text,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
    },

    bodyStyles: {
      fillColor: COLORS.white,
    },

    alternateRowStyles: {
      fillColor: COLORS.light,
    },
  });

  // ===========================
  // Category tables
  // ===========================
  categories.forEach((category) => {
    pdf.addPage();

    drawHeader(pdf, "Analyse de l'Exploitation du Matériel", filters);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(...COLORS.primary);

    pdf.text(
      `${category.code_categorie} - ${category.title}`,
      14,
      42,
    );

    autoTable(pdf, {
      startY: 48,

      head: [
        [
          "Code",
          "Sous famille",
          "Nb",
          "Potentiel",
          "Taux loc.",

          "H. Service",
          "H. Chômage",
          "H. Panne",

          "M. Service",
          "M. Chômage",
          "M. Panne",
        ],
      ],

      body: category.rows.map((r) => [
        r.code_sous_famille,
        r.libelle_sous_famille,

        r.nbr,
        r.potentiel_total.toFixed(1),
        r.taux_location.toFixed(2),

        `${r.heures_service.toFixed(1)}\n${r.pct_heures_service.toFixed(1)}%`,
        `${r.heures_chomage.toFixed(1)}\n${r.pct_heures_chomage.toFixed(1)}%`,
        `${r.heures_panne.toFixed(1)}\n${r.pct_heures_panne.toFixed(1)}%`,

        `${r.montant_service.toFixed(2)}\n${r.pct_montant_service.toFixed(1)}%`,
        `${r.montant_chomage.toFixed(2)}\n${r.pct_montant_chomage.toFixed(1)}%`,
        `${r.montant_panne.toFixed(2)}\n${r.pct_montant_panne.toFixed(1)}%`,
      ]),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.8,
        lineWidth: 0.2,
        lineColor: COLORS.border,
        textColor: COLORS.text,
        valign: "middle",
        halign: "center",
      },

      columnStyles: {
        0: {
          cellWidth: 18,
          fontStyle: "bold",
        },

        1: {
          cellWidth: 55,
          halign: "left",
        },

        2: {
          cellWidth: 15,
        },

        3: {
          cellWidth: 22,
        },

        4: {
          cellWidth: 22,
        },
      },

      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.primary,
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: COLORS.light,
      },

      bodyStyles: {
        fillColor: COLORS.white,
      },
    });
  });

  drawFooter(pdf);

  pdf.save("Analyse_Exploitation.pdf");
}