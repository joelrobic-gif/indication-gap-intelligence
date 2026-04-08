"use client";
import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// INDICATION GAP INTELLIGENCE ENGINE v2.0
// L99 Panel × PTRS × Competitive Intelligence × NLQ × Portfolio Analytics
// Modeled on: IQVIA, Clarivate Cortellis, BioMedTracker, Citeline, Evaluate Pharma
// ═══════════════════════════════════════════════════════════════════════════════

// ═══ DATA LAYER ═══

const COUNTRIES = [
  { code: "CA", name: "Canada", authority: "Health Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "US", name: "United States", authority: "FDA", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "EU", name: "European Union", authority: "EMA", flag: "\u{1F1EA}\u{1F1FA}" },
  { code: "UK", name: "United Kingdom", authority: "MHRA", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "JP", name: "Japan", authority: "PMDA", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "AU", name: "Australia", authority: "TGA", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "KR", name: "South Korea", authority: "MFDS", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "CN", name: "China", authority: "NMPA", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "IN", name: "India", authority: "CDSCO", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "BR", name: "Brazil", authority: "ANVISA", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "CH", name: "Switzerland", authority: "Swissmedic", flag: "\u{1F1E8}\u{1F1ED}" },
  { code: "IL", name: "Israel", authority: "MOH", flag: "\u{1F1EE}\u{1F1F1}" },
];

const COMPANIES = [
  {
    id: "pharmascience", name: "Pharmascience", hq: "Montreal, Canada",
    molecules: [
      { name: "Metformin HCl", class: "Biguanide", originalIndication: "Type 2 Diabetes", atc: "A10BA02", ta: "metabolic" },
      { name: "Amlodipine Besylate", class: "CCB", originalIndication: "Hypertension / Angina", atc: "C08CA01", ta: "cardiovascular" },
      { name: "Atorvastatin Calcium", class: "Statin", originalIndication: "Hyperlipidemia", atc: "C10AA05", ta: "cardiovascular" },
      { name: "Omeprazole", class: "PPI", originalIndication: "GERD / Peptic Ulcer", atc: "A02BC01", ta: "gi" },
      { name: "Gabapentin", class: "GABA Analog", originalIndication: "Epilepsy / Neuropathic Pain", atc: "N03AX12", ta: "cns" },
      { name: "Celecoxib", class: "COX-2 Inhibitor", originalIndication: "Osteoarthritis / RA", atc: "M01AH01", ta: "inflammation" },
      { name: "Tamsulosin HCl", class: "Alpha-1 Blocker", originalIndication: "BPH", atc: "G04CA02", ta: "urology" },
      { name: "Clopidogrel", class: "P2Y12 Inhibitor", originalIndication: "ACS / Stroke Prevention", atc: "B01AC04", ta: "cardiovascular" },
      { name: "Venlafaxine HCl", class: "SNRI", originalIndication: "MDD / GAD", atc: "N06AA22", ta: "cns" },
      { name: "Montelukast Sodium", class: "LTRA", originalIndication: "Asthma / Allergic Rhinitis", atc: "R03DC03", ta: "respiratory" },
      { name: "Topiramate", class: "Sulfamate", originalIndication: "Epilepsy / Migraine", atc: "N03AX11", ta: "cns" },
      { name: "Colchicine", class: "Alkaloid", originalIndication: "Gout / FMF", atc: "M04AC01", ta: "inflammation" },
    ],
  },
  {
    id: "apotex", name: "Apotex", hq: "Toronto, Canada",
    molecules: [
      { name: "Rosuvastatin", class: "Statin", originalIndication: "Hyperlipidemia", atc: "C10AA07", ta: "cardiovascular" },
      { name: "Pantoprazole", class: "PPI", originalIndication: "GERD", atc: "A02BC02", ta: "gi" },
      { name: "Escitalopram", class: "SSRI", originalIndication: "MDD / GAD", atc: "N06AB10", ta: "cns" },
      { name: "Losartan", class: "ARB", originalIndication: "Hypertension", atc: "C09CA01", ta: "cardiovascular" },
      { name: "Duloxetine", class: "SNRI", originalIndication: "MDD / Neuropathic Pain", atc: "N06AX21", ta: "cns" },
      { name: "Quetiapine", class: "Atypical Antipsychotic", originalIndication: "Schizophrenia / Bipolar", atc: "N05AH04", ta: "cns" },
      { name: "Pregabalin", class: "GABA Analog", originalIndication: "Neuropathic Pain / Epilepsy", atc: "N03AX16", ta: "cns" },
      { name: "Telmisartan", class: "ARB", originalIndication: "Hypertension", atc: "C09CA07", ta: "cardiovascular" },
    ],
  },
  {
    id: "teva", name: "Teva Pharmaceutical", hq: "Tel Aviv, Israel",
    molecules: [
      { name: "Glatiramer Acetate", class: "Immunomodulator", originalIndication: "Multiple Sclerosis", atc: "L03AX13", ta: "inflammation" },
      { name: "Levetiracetam", class: "Racetam", originalIndication: "Epilepsy", atc: "N03AX14", ta: "cns" },
      { name: "Aripiprazole", class: "Atypical Antipsychotic", originalIndication: "Schizophrenia / Bipolar", atc: "N05AX12", ta: "cns" },
      { name: "Fingolimod", class: "S1P Modulator", originalIndication: "Multiple Sclerosis", atc: "L04AA27", ta: "inflammation" },
      { name: "Deferasirox", class: "Iron Chelator", originalIndication: "Iron Overload", atc: "V03AC03", ta: "hematology" },
      { name: "Rasagiline", class: "MAO-B Inhibitor", originalIndication: "Parkinson's Disease", atc: "N04BD02", ta: "cns" },
    ],
  },
  {
    id: "sandoz", name: "Sandoz (Novartis)", hq: "Basel, Switzerland",
    molecules: [
      { name: "Cyclosporine", class: "Calcineurin Inhibitor", originalIndication: "Transplant Rejection", atc: "L04AD01", ta: "inflammation" },
      { name: "Mycophenolate Mofetil", class: "IMPDH Inhibitor", originalIndication: "Transplant Rejection", atc: "L04AA06", ta: "inflammation" },
      { name: "Tacrolimus", class: "Calcineurin Inhibitor", originalIndication: "Transplant Rejection", atc: "L04AD02", ta: "inflammation" },
      { name: "Lenalidomide", class: "IMiD", originalIndication: "Multiple Myeloma", atc: "L04AX04", ta: "oncology" },
      { name: "Azathioprine", class: "Purine Analog", originalIndication: "Transplant / Autoimmune", atc: "L04AX01", ta: "inflammation" },
      { name: "Everolimus", class: "mTOR Inhibitor", originalIndication: "Transplant / Oncology", atc: "L04AA18", ta: "oncology" },
    ],
  },
  {
    id: "sun", name: "Sun Pharma", hq: "Mumbai, India",
    molecules: [
      { name: "Imatinib", class: "TKI", originalIndication: "CML / GIST", atc: "L01EA01", ta: "oncology" },
      { name: "Erlotinib", class: "EGFR TKI", originalIndication: "NSCLC / Pancreatic", atc: "L01EB02", ta: "oncology" },
      { name: "Bortezomib", class: "Proteasome Inhibitor", originalIndication: "Multiple Myeloma", atc: "L01XG01", ta: "oncology" },
      { name: "Temozolomide", class: "Alkylating Agent", originalIndication: "GBM / Anaplastic Astrocytoma", atc: "L01AX03", ta: "oncology" },
      { name: "Sorafenib", class: "Multi-kinase Inhibitor", originalIndication: "HCC / RCC", atc: "L01EX02", ta: "oncology" },
    ],
  },
  {
    id: "mylan", name: "Viatris (Mylan)", hq: "Canonsburg, USA",
    molecules: [
      { name: "Dapagliflozin", class: "SGLT2 Inhibitor", originalIndication: "Type 2 Diabetes", atc: "A10BK01", ta: "metabolic" },
      { name: "Empagliflozin", class: "SGLT2 Inhibitor", originalIndication: "Type 2 Diabetes", atc: "A10BK03", ta: "metabolic" },
      { name: "Sitagliptin", class: "DPP-4 Inhibitor", originalIndication: "Type 2 Diabetes", atc: "A10BH01", ta: "metabolic" },
      { name: "Apixaban", class: "Factor Xa Inhibitor", originalIndication: "VTE / AF", atc: "B01AF02", ta: "hematology" },
      { name: "Rivaroxaban", class: "Factor Xa Inhibitor", originalIndication: "VTE / AF", atc: "B01AF01", ta: "hematology" },
    ],
  },
];

// ═══ FEATURE #1: PTRS ENGINE (BioMedTracker / IQVIA) ═══
// Phase transition base rates by therapeutic area (source: BIO/QLS Advisors 2024 data)
const PTRS_BASE_RATES = {
  oncology:       { p1_p2: 0.329, p2_p3: 0.289, p3_nda: 0.576, nda_appr: 0.906, overall_loa: 0.053, avg_months: 132 },
  cardiovascular: { p1_p2: 0.561, p2_p3: 0.362, p3_nda: 0.651, nda_appr: 0.919, overall_loa: 0.121, avg_months: 108 },
  cns:            { p1_p2: 0.517, p2_p3: 0.298, p3_nda: 0.597, nda_appr: 0.903, overall_loa: 0.083, avg_months: 120 },
  metabolic:      { p1_p2: 0.583, p2_p3: 0.412, p3_nda: 0.687, nda_appr: 0.935, overall_loa: 0.154, avg_months: 96 },
  inflammation:   { p1_p2: 0.534, p2_p3: 0.331, p3_nda: 0.631, nda_appr: 0.912, overall_loa: 0.102, avg_months: 114 },
  respiratory:    { p1_p2: 0.571, p2_p3: 0.389, p3_nda: 0.668, nda_appr: 0.928, overall_loa: 0.141, avg_months: 102 },
  gi:             { p1_p2: 0.548, p2_p3: 0.356, p3_nda: 0.644, nda_appr: 0.921, overall_loa: 0.117, avg_months: 110 },
  hematology:     { p1_p2: 0.547, p2_p3: 0.378, p3_nda: 0.663, nda_appr: 0.929, overall_loa: 0.128, avg_months: 106 },
  urology:        { p1_p2: 0.556, p2_p3: 0.351, p3_nda: 0.638, nda_appr: 0.918, overall_loa: 0.115, avg_months: 112 },
};

function calculatePTRS(evidence, therapeuticArea) {
  const rates = PTRS_BASE_RATES[therapeuticArea] || PTRS_BASE_RATES.inflammation;
  if (evidence.includes("Phase IV") || evidence.includes("approved")) return { ptrs: 0.95, phase: "Approved", remaining: 0 };
  if (evidence.includes("Phase III")) {
    const ptrs = rates.p3_nda * rates.nda_appr;
    return { ptrs, phase: "Phase III", remaining: Math.round(rates.avg_months * 0.3) };
  }
  if (evidence.includes("Phase II")) {
    const ptrs = rates.p2_p3 * rates.p3_nda * rates.nda_appr;
    return { ptrs, phase: "Phase II", remaining: Math.round(rates.avg_months * 0.6) };
  }
  if (evidence.includes("Phase I")) {
    const ptrs = rates.p1_p2 * rates.p2_p3 * rates.p3_nda * rates.nda_appr;
    return { ptrs, phase: "Phase I", remaining: rates.avg_months };
  }
  return { ptrs: 0.02, phase: "Preclinical", remaining: rates.avg_months + 24 };
}

// ═══ FEATURE #3: COMPETITIVE PIPELINE RADAR ═══
const COMPETITIVE_PIPELINE = {
  "Polycystic Ovary Syndrome (PCOS)": [
    { company: "Novo Nordisk", molecule: "Semaglutide", phase: "Phase III", mechanism: "GLP-1 RA" },
    { company: "Spruce Bio", molecule: "Tildacerfont", phase: "Phase II", mechanism: "CRF1 antagonist" },
  ],
  "Colorectal Cancer Adjuvant": [
    { company: "Merck", molecule: "Pembrolizumab", phase: "Phase III", mechanism: "PD-1" },
    { company: "BMS", molecule: "Nivolumab+Ipi", phase: "Phase III", mechanism: "PD-1+CTLA-4" },
    { company: "Roche", molecule: "Atezolizumab", phase: "Phase III", mechanism: "PD-L1" },
  ],
  "Cardiovascular Event Prevention": [
    { company: "Novartis", molecule: "Inclisiran", phase: "Approved", mechanism: "PCSK9 siRNA" },
    { company: "Agepha Pharma", molecule: "Low-dose Colchicine", phase: "Phase III", mechanism: "Anti-inflammatory" },
  ],
  "Heart Failure (HFrEF)": [
    { company: "AstraZeneca", molecule: "Dapagliflozin", phase: "Approved", mechanism: "SGLT2i" },
    { company: "Boehringer", molecule: "Empagliflozin", phase: "Approved", mechanism: "SGLT2i" },
    { company: "Cytokinetics", molecule: "Aficamten", phase: "Phase III", mechanism: "Cardiac myosin" },
  ],
  "Chronic Kidney Disease": [
    { company: "AstraZeneca", molecule: "Dapagliflozin", phase: "Approved", mechanism: "SGLT2i" },
    { company: "Bayer", molecule: "Finerenone", phase: "Approved", mechanism: "nsMRA" },
    { company: "Novo Nordisk", molecule: "Semaglutide", phase: "Phase III", mechanism: "GLP-1 RA" },
  ],
  "Migraine Prevention": [
    { company: "AbbVie", molecule: "Atogepant", phase: "Approved", mechanism: "CGRP antagonist" },
    { company: "Pfizer", molecule: "Rimegepant", phase: "Approved", mechanism: "CGRP antagonist" },
    { company: "Teva", molecule: "Fremanezumab", phase: "Approved", mechanism: "Anti-CGRP mAb" },
  ],
  "Alcohol Use Disorder": [
    { company: "Indivior", molecule: "Nalmefene", phase: "Approved (EU)", mechanism: "Opioid antagonist" },
    { company: "Adial Pharma", molecule: "AD04", phase: "Phase III", mechanism: "Serotonergic" },
  ],
  "Binge Eating Disorder": [
    { company: "Takeda", molecule: "Lisdexamfetamine", phase: "Approved", mechanism: "CNS stimulant" },
    { company: "Novo Nordisk", molecule: "Semaglutide", phase: "Phase III", mechanism: "GLP-1 RA" },
  ],
  "Multiple Myeloma": [
    { company: "J&J", molecule: "Teclistamab", phase: "Approved", mechanism: "BCMAxCD3 BiTE" },
    { company: "Pfizer", molecule: "Elranatamab", phase: "Approved", mechanism: "BCMAxCD3 BiTE" },
    { company: "BMS", molecule: "Iberdomide", phase: "Phase III", mechanism: "CELMoD" },
  ],
  "CML": [
    { company: "Novartis", molecule: "Asciminib", phase: "Approved", mechanism: "STAMP inhibitor" },
    { company: "Pfizer", molecule: "Bosutinib", phase: "Approved", mechanism: "TKI" },
  ],
  "NASH / MASLD": [
    { company: "Madrigal", molecule: "Resmetirom", phase: "Approved", mechanism: "THR-beta agonist" },
    { company: "Novo Nordisk", molecule: "Semaglutide", phase: "Phase III", mechanism: "GLP-1 RA" },
    { company: "Akero", molecule: "Efruxifermin", phase: "Phase III", mechanism: "FGF21 analog" },
  ],
  "Pericarditis": [
    { company: "Kiniksa", molecule: "Rilonacept", phase: "Approved", mechanism: "IL-1 trap" },
    { company: "Swedish Orphan", molecule: "Anakinra", phase: "Phase III", mechanism: "IL-1RA" },
  ],
  "Familial Adenomatous Polyposis": [
    { company: "Recursion", molecule: "REC-4881", phase: "Phase II", mechanism: "MEK inhibitor" },
  ],
  "Restless Legs Syndrome": [
    { company: "UCB", molecule: "Rotigotine", phase: "Approved", mechanism: "Dopamine agonist" },
    { company: "Jazz Pharma", molecule: "Sodium oxybate", phase: "Approved", mechanism: "CNS depressant" },
  ],
};

// ═══ UNMET NEED SCORING (GlobalData/IQVIA model) ═══
const UNMET_NEED = {
  "Polycystic Ovary Syndrome (PCOS)": { score: 82, currentSoC: "Metformin (off-label) + OCP", gaps: "No approved drug, metabolic+reproductive combined" },
  "Colorectal Cancer Adjuvant": { score: 71, currentSoC: "FOLFOX/CAPOX", gaps: "MSS tumors poorly served by IO" },
  "Anti-Aging / Longevity (TAME Trial)": { score: 95, currentSoC: "None approved", gaps: "No regulatory framework for aging indication" },
  "Cardiovascular Event Prevention": { score: 68, currentSoC: "Statins + ASA", gaps: "Residual inflammatory risk under-addressed" },
  "Alcohol Use Disorder": { score: 88, currentSoC: "Naltrexone + counseling", gaps: "50% relapse rate, poor adherence, stigma" },
  "NASH / MASLD": { score: 85, currentSoC: "Resmetirom (new)", gaps: "Fibrosis reversal limited, combo needed" },
  "Chronic Kidney Disease": { score: 72, currentSoC: "SGLT2i + RASi", gaps: "Late-stage progression, transplant shortage" },
  "Heart Failure (HFrEF)": { score: 65, currentSoC: "GDMT (ARNi+BB+MRA+SGLT2i)", gaps: "Titration challenges, HFpEF gap" },
  "Pericarditis": { score: 79, currentSoC: "NSAIDs + colchicine", gaps: "Recurrence in 30%, limited anti-IL-1 access" },
  "Binge Eating Disorder": { score: 76, currentSoC: "Lisdexamfetamine", gaps: "Single approved drug, CV side effects" },
};

// ═══ INDICATION DATA ═══
function generateIndicationData(molecule) {
  const pools = {
    "Metformin HCl": [
      { indication: "Type 2 Diabetes Mellitus", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "462M" },
      { indication: "Polycystic Ovary Syndrome (PCOS)", countries: ["US","EU","UK","AU","IL"], evidence: "Phase III", patients: "116M" },
      { indication: "Gestational Diabetes Prevention", countries: ["UK","AU"], evidence: "Phase III", patients: "21M" },
      { indication: "Colorectal Cancer Adjuvant", countries: ["JP","KR"], evidence: "Phase II", patients: "1.9M" },
      { indication: "Breast Cancer Adjuvant", countries: ["CN"], evidence: "Phase II", patients: "2.3M" },
      { indication: "Anti-Aging / Longevity (TAME Trial)", countries: [], evidence: "Phase III (ongoing)", patients: "N/A" },
      { indication: "Endometrial Cancer Prevention", countries: ["JP"], evidence: "Phase II", patients: "0.4M" },
      { indication: "COVID-19 Outpatient Treatment", countries: [], evidence: "Phase III (completed)", patients: "N/A" },
    ],
    "Colchicine": [
      { indication: "Gout Flares", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "41M" },
      { indication: "Familial Mediterranean Fever", countries: ["CA","US","EU","UK","JP","AU","IL","CH"], evidence: "Phase IV", patients: "0.15M" },
      { indication: "Pericarditis", countries: ["US","EU","UK","AU","CH","IL"], evidence: "Phase III", patients: "28/100K" },
      { indication: "Cardiovascular Event Prevention", countries: ["CA","AU"], evidence: "Phase III (COLCOT)", patients: "32M" },
      { indication: "COVID-19 Community Treatment", countries: ["CA"], evidence: "Phase III (COLCORONA)", patients: "N/A" },
      { indication: "Atrial Fibrillation Post-Surgery", countries: ["AU"], evidence: "Phase III", patients: "5M" },
      { indication: "Liver Fibrosis / Cirrhosis", countries: ["CN","IN"], evidence: "Phase II", patients: "1.5B" },
      { indication: "Behcet Disease", countries: ["JP","KR","IL"], evidence: "Phase III", patients: "0.02M" },
    ],
    "Celecoxib": [
      { indication: "Osteoarthritis", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "528M" },
      { indication: "Rheumatoid Arthritis", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "18M" },
      { indication: "Familial Adenomatous Polyposis", countries: ["US"], evidence: "Phase III", patients: "0.03M" },
      { indication: "Colorectal Cancer Prevention", countries: ["US","JP"], evidence: "Phase III", patients: "1.9M" },
      { indication: "Ankylosing Spondylitis", countries: ["US","EU","UK","AU","CN"], evidence: "Phase III", patients: "3.2M" },
      { indication: "Breast Cancer Adjuvant (COX-2 pathway)", countries: [], evidence: "Phase II", patients: "2.3M" },
      { indication: "Bipolar Depression Adjunct", countries: [], evidence: "Phase II (emerging)", patients: "46M" },
    ],
    "Gabapentin": [
      { indication: "Epilepsy (Adjunctive)", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "50M" },
      { indication: "Postherpetic Neuralgia", countries: ["CA","US","EU","UK","JP","AU","CH"], evidence: "Phase IV", patients: "15M" },
      { indication: "Restless Legs Syndrome", countries: ["US","EU","UK"], evidence: "Phase III", patients: "36M" },
      { indication: "Fibromyalgia", countries: ["JP"], evidence: "Phase III", patients: "4M" },
      { indication: "Hot Flashes (Menopause)", countries: ["US","UK"], evidence: "Phase III", patients: "47M" },
      { indication: "Alcohol Use Disorder", countries: [], evidence: "Phase II", patients: "283M" },
      { indication: "Generalized Anxiety Disorder", countries: ["UK"], evidence: "Phase III", patients: "284M" },
      { indication: "Chronic Cough", countries: ["AU"], evidence: "Phase II", patients: "N/A" },
    ],
    "Topiramate": [
      { indication: "Epilepsy", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "50M" },
      { indication: "Migraine Prevention", countries: ["CA","US","EU","UK","JP","AU","CH"], evidence: "Phase IV", patients: "1B" },
      { indication: "Weight Management (w/ Phentermine)", countries: ["US"], evidence: "Phase III (Qsymia)", patients: "650M" },
      { indication: "Alcohol Use Disorder", countries: [], evidence: "Phase III", patients: "283M" },
      { indication: "Binge Eating Disorder", countries: ["US"], evidence: "Phase III", patients: "2.8M" },
      { indication: "PTSD", countries: [], evidence: "Phase II", patients: "13M" },
      { indication: "Neonatal Seizures", countries: ["EU"], evidence: "Phase II", patients: "N/A" },
      { indication: "Bulimia Nervosa", countries: ["US"], evidence: "Phase III", patients: "N/A" },
    ],
    "Atorvastatin Calcium": [
      { indication: "Hyperlipidemia", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "380M" },
      { indication: "Primary CV Event Prevention", countries: ["CA","US","EU","UK","JP","AU","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Secondary CV Event Prevention", countries: ["CA","US","EU","UK","JP","AU","KR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Chronic Kidney Disease Progression", countries: ["JP","KR"], evidence: "Phase III", patients: "843M" },
      { indication: "Non-Alcoholic Fatty Liver Disease", countries: ["CN"], evidence: "Phase II", patients: "1B" },
      { indication: "Breast Cancer Prevention (adjunctive)", countries: [], evidence: "Phase II", patients: "2.3M" },
      { indication: "Alzheimer's Disease Prevention", countries: [], evidence: "Phase III (mixed)", patients: "55M" },
    ],
    "Amlodipine Besylate": [
      { indication: "Hypertension", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "1.28B" },
      { indication: "Chronic Stable Angina", countries: ["CA","US","EU","UK","JP","AU","CH"], evidence: "Phase IV", patients: "112M" },
      { indication: "Vasospastic Angina", countries: ["CA","US","EU","UK","JP","AU","CH"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Raynaud's Phenomenon", countries: ["UK","EU"], evidence: "Phase III", patients: "N/A" },
      { indication: "Diabetic Nephropathy (combo)", countries: ["JP","KR"], evidence: "Phase III", patients: "N/A" },
    ],
    "Omeprazole": [
      { indication: "GERD", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Peptic Ulcer Disease", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "H. pylori Eradication (combo)", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","CH"], evidence: "Phase IV", patients: "4.4B" },
      { indication: "Zollinger-Ellison Syndrome", countries: ["CA","US","EU","UK","JP","AU","CH"], evidence: "Phase IV", patients: "0.001M" },
      { indication: "Eosinophilic Esophagitis", countries: ["US","EU"], evidence: "Phase III", patients: "0.16M" },
    ],
    "Tamsulosin HCl": [
      { indication: "Benign Prostatic Hyperplasia", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Ureteral Stone Expulsion (MET)", countries: ["US","EU","UK","AU","JP"], evidence: "Phase III", patients: "N/A" },
      { indication: "Chronic Prostatitis / CPPS", countries: ["JP","KR"], evidence: "Phase III", patients: "N/A" },
    ],
    "Clopidogrel": [
      { indication: "ACS / MI Prevention", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Stroke Prevention", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "PAD", countries: ["CA","US","EU","UK","JP","AU","CH"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Kawasaki Disease (pediatric)", countries: ["JP","KR"], evidence: "Phase III", patients: "N/A" },
    ],
    "Venlafaxine HCl": [
      { indication: "Major Depressive Disorder", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "280M" },
      { indication: "Generalized Anxiety Disorder", countries: ["CA","US","EU","UK","AU","CH"], evidence: "Phase IV", patients: "284M" },
      { indication: "Social Anxiety Disorder", countries: ["US","EU","UK","AU"], evidence: "Phase III", patients: "N/A" },
      { indication: "Panic Disorder", countries: ["US","EU","UK"], evidence: "Phase III", patients: "N/A" },
      { indication: "Diabetic Neuropathic Pain", countries: ["US","UK"], evidence: "Phase III", patients: "N/A" },
      { indication: "Hot Flashes (Menopause)", countries: ["US"], evidence: "Phase III", patients: "47M" },
      { indication: "ADHD (adjunctive)", countries: [], evidence: "Phase II", patients: "366M" },
      { indication: "Migraine Prevention", countries: [], evidence: "Phase II", patients: "1B" },
    ],
    "Montelukast Sodium": [
      { indication: "Asthma", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "262M" },
      { indication: "Allergic Rhinitis", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","CH"], evidence: "Phase IV", patients: "400M" },
      { indication: "Exercise-Induced Bronchoconstriction", countries: ["US","EU","AU"], evidence: "Phase III", patients: "N/A" },
      { indication: "COPD (adjunctive)", countries: ["JP","CN"], evidence: "Phase III", patients: "392M" },
      { indication: "Atopic Dermatitis", countries: ["KR","JP"], evidence: "Phase II", patients: "230M" },
      { indication: "Post-COVID Respiratory Symptoms", countries: [], evidence: "Phase II (emerging)", patients: "N/A" },
    ],
    "Rosuvastatin": [
      { indication: "Hyperlipidemia", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "380M" },
      { indication: "Primary CV Prevention", countries: ["US","EU","UK","JP","AU","CH"], evidence: "Phase IV (JUPITER)", patients: "N/A" },
      { indication: "Heart Failure (adjunctive)", countries: ["JP"], evidence: "Phase III", patients: "64M" },
      { indication: "CKD Progression", countries: ["KR","CN"], evidence: "Phase II", patients: "843M" },
    ],
    "Imatinib": [
      { indication: "CML", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "GIST", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "Ph+ ALL", countries: ["US","EU","UK","JP","AU"], evidence: "Phase III", patients: "N/A" },
      { indication: "Dermatofibrosarcoma Protuberans", countries: ["US","EU"], evidence: "Phase III", patients: "N/A" },
      { indication: "Systemic Mastocytosis", countries: ["US","EU","UK"], evidence: "Phase III", patients: "N/A" },
      { indication: "Pulmonary Arterial Hypertension", countries: ["JP"], evidence: "Phase II", patients: "N/A" },
      { indication: "Type 1 Diabetes (beta-cell)", countries: [], evidence: "Phase II", patients: "8.4M" },
    ],
    "Dapagliflozin": [
      { indication: "Type 2 Diabetes", countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "462M" },
      { indication: "Heart Failure (HFrEF)", countries: ["US","EU","UK","JP","AU","CH"], evidence: "Phase III (DAPA-HF)", patients: "64M" },
      { indication: "Heart Failure (HFpEF)", countries: ["US","EU","UK","JP"], evidence: "Phase III (DELIVER)", patients: "N/A" },
      { indication: "Chronic Kidney Disease", countries: ["US","EU","UK","JP","AU","CH"], evidence: "Phase III (DAPA-CKD)", patients: "843M" },
      { indication: "Type 1 Diabetes", countries: ["EU","JP"], evidence: "Phase III", patients: "8.4M" },
      { indication: "NASH / MASLD", countries: [], evidence: "Phase II", patients: "N/A" },
    ],
    "Lenalidomide": [
      { indication: "Multiple Myeloma", countries: ["CA","US","EU","UK","JP","AU","KR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
      { indication: "MDS with del(5q)", countries: ["US","EU","UK","JP","AU"], evidence: "Phase III", patients: "N/A" },
      { indication: "Mantle Cell Lymphoma", countries: ["US","EU","UK"], evidence: "Phase III", patients: "N/A" },
      { indication: "Follicular Lymphoma", countries: ["US","EU"], evidence: "Phase III", patients: "N/A" },
      { indication: "CLL (combo w/ rituximab)", countries: ["EU"], evidence: "Phase III", patients: "N/A" },
      { indication: "Diffuse Large B-Cell Lymphoma", countries: [], evidence: "Phase II/III", patients: "N/A" },
    ],
  };
  return pools[molecule.name] || [
    { indication: molecule.originalIndication, countries: ["CA","US","EU","UK","JP","AU","KR","CN","IN","BR","CH","IL"], evidence: "Phase IV", patients: "N/A" },
  ];
}

// ═══ ENHANCED SCORING (with PTRS + Unmet Need) ═══
function scoreGap(indication, homeCountry, molecule) {
  const approvedCount = indication.countries.length;
  const gapExists = !indication.countries.includes(homeCountry) && approvedCount > 0;
  if (!gapExists) return null;

  const evidenceScore = indication.evidence.includes("Phase IV") ? 0 : indication.evidence.includes("Phase III") ? 85 : indication.evidence.includes("Phase II") ? 60 : 30;
  const breadthScore = Math.min(approvedCount * 12, 95);
  const regulatoryEase = approvedCount >= 4 ? 90 : approvedCount >= 2 ? 70 : 50;
  const commercialScore = indication.patients !== "N/A" ? 75 : 50;

  // PTRS calculation
  const ptrsData = calculatePTRS(indication.evidence, molecule.ta || "inflammation");

  // Unmet need overlay
  const unmet = UNMET_NEED[indication.indication];
  const unmetScore = unmet ? unmet.score : 50;

  // Competitive density
  const competitors = COMPETITIVE_PIPELINE[indication.indication] || [];
  const compDensity = competitors.length;
  const competitiveScore = compDensity === 0 ? 95 : compDensity <= 2 ? 75 : compDensity <= 4 ? 55 : 35;

  // Enhanced composite: evidence(20) + breadth(15) + regulatory(15) + commercial(15) + ptrs(15) + unmet(10) + competitive(10)
  const composite = Math.round(
    evidenceScore * 0.20 + breadthScore * 0.15 + regulatoryEase * 0.15 +
    commercialScore * 0.15 + (ptrsData.ptrs * 100) * 0.15 + unmetScore * 0.10 + competitiveScore * 0.10
  );

  let viability = "Low", color = "#ef4444";
  if (composite >= 75) { viability = "Excellent"; color = "#34d399"; }
  else if (composite >= 60) { viability = "Strong"; color = "#fbbf24"; }
  else if (composite >= 45) { viability = "Moderate"; color = "#60a5fa"; }

  return {
    molecule: molecule.name, moleculeClass: molecule.class, ta: molecule.ta,
    indication: indication.indication,
    approvedIn: indication.countries, notApprovedIn: homeCountry,
    evidence: indication.evidence, patientPop: indication.patients,
    scores: { evidence: evidenceScore, breadth: breadthScore, regulatory: regulatoryEase, commercial: commercialScore, composite },
    ptrs: ptrsData,
    unmetNeed: unmet || null,
    competitors: competitors,
    competitiveScore,
    viability, color,
  };
}

// ═══ SMALL COMPONENTS ═══

function ScoreBar({ value, max = 99, color = "#d4a853", label }) {
  return (
    <div style={{ marginBottom: 6 }}>
      {label && <div style={{ fontSize: 10, color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 3 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 5, background: "#1a1a26", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: "width 0.6s ease" }} />
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color, fontWeight: 700, minWidth: 28 }}>{value}</span>
      </div>
    </div>
  );
}

function Tag({ children, color = "#d4a853" }) {
  return (
    <span style={{
      display: "inline-block", fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
      padding: "2px 7px", borderRadius: 3, letterSpacing: 0.5, textTransform: "uppercase",
      fontWeight: 600, background: `${color}20`, color, marginRight: 4, marginBottom: 2,
    }}>{children}</span>
  );
}

function CountryPill({ code, active }) {
  const c = COUNTRIES.find(x => x.code === code);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, padding: "2px 6px",
      borderRadius: 4, background: active ? "#34d39920" : "#1a1a26", color: active ? "#34d399" : "#5555708a",
      border: `1px solid ${active ? "#34d39940" : "#2a2a3e"}`, marginRight: 3, marginBottom: 3,
    }}>
      {c?.flag} {code}
    </span>
  );
}

// ═══ FEATURE #1: PTRS GAUGE ═══
function PTRSGauge({ ptrs, size = "sm" }) {
  const pct = Math.round(ptrs.ptrs * 100);
  const gaugeColor = pct >= 50 ? "#34d399" : pct >= 25 ? "#fbbf24" : pct >= 10 ? "#60a5fa" : "#ef4444";
  const r = size === "lg" ? 40 : 22;
  const stroke = size === "lg" ? 6 : 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const dim = (r + stroke) * 2;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width={dim} height={dim} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke="#1a1a26" strokeWidth={stroke} />
        <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke={gaugeColor} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x={r + stroke} y={r + stroke} textAnchor="middle" dominantBaseline="central"
          style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size === "lg" ? 16 : 10, fontWeight: 700, fill: gaugeColor, fontFamily: "'JetBrains Mono', monospace" }}>
          {pct}%
        </text>
      </svg>
      <div style={{ fontSize: size === "lg" ? 11 : 8, color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>PTRS</div>
      {size === "lg" && ptrs.remaining > 0 && (
        <div style={{ fontSize: 10, color: "#5555708a" }}>{ptrs.remaining}mo to approval</div>
      )}
    </div>
  );
}

// ═══ FEATURE #5: WATCHLIST STAR ═══
function WatchlistStar({ gapKey, watchlist, toggle }) {
  const isWatched = watchlist.includes(gapKey);
  return (
    <button onClick={e => { e.stopPropagation(); toggle(gapKey); }}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, color: isWatched ? "#d4a853" : "#2a2a3e", transition: "color 0.2s" }}
      title={isWatched ? "Remove from watchlist" : "Add to watchlist"}>
      {isWatched ? "\u2605" : "\u2606"}
    </button>
  );
}

// ═══ MAIN APP ═══
export default function IndicationGapIntelligence() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [homeCountry, setHomeCountry] = useState("CA");
  const [gaps, setGaps] = useState([]);
  const [selectedGap, setSelectedGap] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [view, setView] = useState("dashboard"); // dashboard | heatmap | comparator | portfolio | detail
  const [sortBy, setSortBy] = useState("composite");
  const [filterViability, setFilterViability] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("igi_watchlist") || "[]"); } catch { return []; }
  });
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);
  const chatEndRef = useRef(null);

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem("igi_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = useCallback((key) => {
    setWatchlist(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  const gapKey = (g) => `${g.molecule}::${g.indication}`;

  // Compute gaps
  useEffect(() => {
    const allGaps = [];
    selectedCompany.molecules.forEach(mol => {
      generateIndicationData(mol).forEach(ind => {
        const gap = scoreGap(ind, homeCountry, mol);
        if (gap) allGaps.push(gap);
      });
    });
    allGaps.sort((a, b) => b.scores.composite - a.scores.composite);
    setGaps(allGaps);
    setSelectedGap(null);
    setAnalysisResult(null);
    setCompareSelection([]);
    if (view === "detail") setView("dashboard");
  }, [selectedCompany, homeCountry]);

  // Filtered + sorted gaps
  const processedGaps = useMemo(() => {
    let result = gaps;
    if (filterViability !== "all") result = result.filter(g => g.viability === filterViability);
    if (showWatchlistOnly) result = result.filter(g => watchlist.includes(gapKey(g)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.molecule.toLowerCase().includes(q) || g.indication.toLowerCase().includes(q) ||
        g.moleculeClass.toLowerCase().includes(q) || g.evidence.toLowerCase().includes(q) ||
        (g.ta || "").toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === "composite") return b.scores.composite - a.scores.composite;
      if (sortBy === "evidence") return b.scores.evidence - a.scores.evidence;
      if (sortBy === "breadth") return b.scores.breadth - a.scores.breadth;
      if (sortBy === "ptrs") return b.ptrs.ptrs - a.ptrs.ptrs;
      if (sortBy === "competitive") return b.competitiveScore - a.competitiveScore;
      return b.scores.composite - a.scores.composite;
    });
  }, [gaps, filterViability, showWatchlistOnly, watchlist, searchQuery, sortBy]);

  // ═══ FEATURE #7: PORTFOLIO ANALYTICS ═══
  const portfolioStats = useMemo(() => {
    if (gaps.length === 0) return null;
    const excellent = gaps.filter(g => g.viability === "Excellent");
    const strong = gaps.filter(g => g.viability === "Strong");
    const avgPTRS = gaps.reduce((s, g) => s + g.ptrs.ptrs, 0) / gaps.length;
    const avgComposite = gaps.reduce((s, g) => s + g.scores.composite, 0) / gaps.length;
    const taDistribution = {};
    gaps.forEach(g => { taDistribution[g.ta] = (taDistribution[g.ta] || 0) + 1; });
    const topTA = Object.entries(taDistribution).sort((a, b) => b[1] - a[1]);
    const totalCompetitors = gaps.reduce((s, g) => s + g.competitors.length, 0);
    const whitespace = gaps.filter(g => g.competitors.length === 0).length;
    const phaseDistribution = { "Phase II": 0, "Phase III": 0, "Approved": 0 };
    gaps.forEach(g => {
      if (g.evidence.includes("Phase III")) phaseDistribution["Phase III"]++;
      else if (g.evidence.includes("Phase II")) phaseDistribution["Phase II"]++;
      else if (g.ptrs.phase === "Approved") phaseDistribution["Approved"]++;
    });
    return { excellent: excellent.length, strong: strong.length, avgPTRS, avgComposite, taDistribution, topTA, totalCompetitors, whitespace, phaseDistribution, total: gaps.length };
  }, [gaps]);

  // ═══ FEATURE #4: AI CHAT / NLQ ═══
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    const dataContext = `You are a pharmaceutical intelligence AI assistant embedded in an Indication Gap Intelligence platform.
Current company: ${selectedCompany.name} (${selectedCompany.hq})
Home market: ${COUNTRIES.find(c => c.code === homeCountry)?.name} (${COUNTRIES.find(c => c.code === homeCountry)?.authority})
Total gaps found: ${gaps.length}
Top opportunities: ${gaps.slice(0, 5).map(g => `${g.molecule} -> ${g.indication} (score: ${g.scores.composite}, PTRS: ${Math.round(g.ptrs.ptrs * 100)}%)`).join("; ")}
Viability breakdown: Excellent=${gaps.filter(g => g.viability === "Excellent").length}, Strong=${gaps.filter(g => g.viability === "Strong").length}, Moderate=${gaps.filter(g => g.viability === "Moderate").length}, Low=${gaps.filter(g => g.viability === "Low").length}
Molecules: ${selectedCompany.molecules.map(m => `${m.name} (${m.class})`).join(", ")}

Answer concisely and with specific data from the context. If asked about a specific molecule or indication, reference the scores and competitive landscape.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: dataContext,
          max_tokens: 500,
          messages: [
            ...chatMessages.filter(m => m.role === "user" || m.role === "assistant").slice(-6),
            { role: "user", content: userMsg }
          ],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(i => i.type === "text" ? i.text : "").join("") || "Analysis complete.";
      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      // Deterministic fallback responses
      const lc = userMsg.toLowerCase();
      let reply = "I can help you analyze indication gaps, PTRS scores, competitive landscapes, and portfolio strategy. Ask me about a specific molecule or indication.";
      if (lc.includes("best") || lc.includes("top") || lc.includes("recommend")) {
        const top3 = gaps.slice(0, 3);
        reply = `Top 3 opportunities for ${selectedCompany.name} in ${COUNTRIES.find(c => c.code === homeCountry)?.name}:\n\n${top3.map((g, i) => `${i + 1}. ${g.molecule} -> ${g.indication} (Composite: ${g.scores.composite}, PTRS: ${Math.round(g.ptrs.ptrs * 100)}%, ${g.competitors.length === 0 ? "NO competitors - whitespace" : g.competitors.length + " competitors"})`).join("\n")}`;
      } else if (lc.includes("ptrs") || lc.includes("probability") || lc.includes("approval")) {
        const highPTRS = [...gaps].sort((a, b) => b.ptrs.ptrs - a.ptrs.ptrs).slice(0, 3);
        reply = `Highest PTRS (Probability of Technical & Regulatory Success):\n\n${highPTRS.map(g => `- ${g.molecule} -> ${g.indication}: ${Math.round(g.ptrs.ptrs * 100)}% (${g.ptrs.phase}, ~${g.ptrs.remaining}mo remaining)`).join("\n")}`;
      } else if (lc.includes("compet") || lc.includes("rival") || lc.includes("landscape")) {
        const whitespace = gaps.filter(g => g.competitors.length === 0);
        reply = `Competitive Intelligence Summary:\n- ${whitespace.length} whitespace opportunities (no competitors)\n- ${gaps.filter(g => g.competitors.length > 0).length} contested opportunities\n\nKey whitespace gaps:\n${whitespace.slice(0, 3).map(g => `- ${g.molecule} -> ${g.indication}`).join("\n")}`;
      } else if (lc.includes("portfolio") || lc.includes("strategy")) {
        reply = `Portfolio Analysis for ${selectedCompany.name}:\n- ${gaps.length} total indication gaps identified\n- ${gaps.filter(g => g.viability === "Excellent").length} excellent + ${gaps.filter(g => g.viability === "Strong").length} strong opportunities\n- Avg PTRS: ${Math.round(portfolioStats?.avgPTRS * 100 || 0)}%\n- Avg Composite: ${Math.round(portfolioStats?.avgComposite || 0)}/99\n- Most active TA: ${portfolioStats?.topTA?.[0]?.[0] || "N/A"} (${portfolioStats?.topTA?.[0]?.[1] || 0} gaps)`;
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    }
    setChatLoading(false);
  }, [chatInput, chatLoading, chatMessages, gaps, selectedCompany, homeCountry, portfolioStats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ═══ FEATURE #8: EXPORT / REPORT ═══
  const exportReport = useCallback(() => {
    const homeC = COUNTRIES.find(c => c.code === homeCountry);
    const lines = [
      `INDICATION GAP INTELLIGENCE REPORT`,
      `Generated: ${new Date().toISOString().split("T")[0]}`,
      `Company: ${selectedCompany.name} (${selectedCompany.hq})`,
      `Home Market: ${homeC?.name} (${homeC?.authority})`,
      `Total Gaps: ${gaps.length} | Excellent: ${gaps.filter(g => g.viability === "Excellent").length} | Strong: ${gaps.filter(g => g.viability === "Strong").length}`,
      `Average PTRS: ${Math.round((portfolioStats?.avgPTRS || 0) * 100)}%`,
      `\n${"=".repeat(80)}\nTOP OPPORTUNITIES\n${"=".repeat(80)}`,
    ];
    gaps.slice(0, 15).forEach((g, i) => {
      lines.push(`\n${i + 1}. ${g.molecule} (${g.moleculeClass}) -> ${g.indication}`);
      lines.push(`   Composite: ${g.scores.composite}/99 | Viability: ${g.viability} | PTRS: ${Math.round(g.ptrs.ptrs * 100)}%`);
      lines.push(`   Evidence: ${g.evidence} | Patients: ${g.patientPop}`);
      lines.push(`   Approved in: ${g.approvedIn.join(", ")} | Competitors: ${g.competitors.length}`);
      if (g.unmetNeed) lines.push(`   Unmet Need: ${g.unmetNeed.score}/100 - ${g.unmetNeed.gaps}`);
      if (g.competitors.length > 0) lines.push(`   Pipeline: ${g.competitors.map(c => `${c.company} (${c.molecule}, ${c.phase})`).join("; ")}`);
    });
    lines.push(`\n${"=".repeat(80)}\nCOMPETITIVE WHITESPACE (No competitors)\n${"=".repeat(80)}`);
    gaps.filter(g => g.competitors.length === 0).forEach(g => {
      lines.push(`- ${g.molecule} -> ${g.indication} (Composite: ${g.scores.composite})`);
    });
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => alert("Report copied to clipboard!")).catch(() => {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `IGI_Report_${selectedCompany.name}_${homeCountry}_${new Date().toISOString().split("T")[0]}.txt`;
      a.click(); URL.revokeObjectURL(url);
    });
  }, [gaps, selectedCompany, homeCountry, portfolioStats]);

  // ═══ L99 ANALYSIS (enhanced) ═══
  const runL99Analysis = useCallback(async (gap) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisProgress("Assembling L99 expert panels...");

    const homeC = COUNTRIES.find(c => c.code === homeCountry);
    const approvedCountries = gap.approvedIn.map(code => {
      const c = COUNTRIES.find(x => x.code === code);
      return c ? `${c.name} (${c.authority})` : code;
    }).join(", ");

    const competitorCtx = gap.competitors.length > 0
      ? `\nCOMPETITIVE LANDSCAPE: ${gap.competitors.map(c => `${c.company} - ${c.molecule} (${c.phase}, ${c.mechanism})`).join("; ")}`
      : "\nCOMPETITIVE LANDSCAPE: No direct competitors identified (whitespace opportunity).";

    const unmetCtx = gap.unmetNeed
      ? `\nUNMET NEED: Score ${gap.unmetNeed.score}/100. Current SoC: ${gap.unmetNeed.currentSoC}. Gaps: ${gap.unmetNeed.gaps}`
      : "";

    const prompt = `You are an L99-grade expert panel system. Analyze this drug indication expansion and return ONLY a JSON object.

MOLECULE: ${gap.molecule} (${gap.moleculeClass})
THERAPEUTIC AREA: ${gap.ta}
ORIGINAL INDICATION: ${selectedCompany.molecules.find(m => m.name === gap.molecule)?.originalIndication || "Unknown"}
TARGET NEW INDICATION: ${gap.indication}
APPROVED IN: ${approvedCountries}
NOT YET APPROVED IN: ${homeC.name} (${homeC.authority})
EVIDENCE: ${gap.evidence}
PTRS: ${Math.round(gap.ptrs.ptrs * 100)}% (${gap.ptrs.phase})
EST. TIME TO APPROVAL: ${gap.ptrs.remaining} months
PATIENT POPULATION: ${gap.patientPop}${competitorCtx}${unmetCtx}

Return this exact JSON:
{
  "pharmacological": {
    "score": <0-99>,
    "mechanism_rationale": "<150 words>",
    "dose_considerations": "<80 words>",
    "safety_flags": "<80 words>",
    "key_risk": "<40 words>"
  },
  "clinical": {
    "score": <0-99>,
    "trial_design": "<100 words>",
    "timeline_months": <number>,
    "estimated_cost_cad": "<range>",
    "endpoint_strategy": "<60 words>",
    "recruitment_feasibility": "<60 words>"
  },
  "regulatory": {
    "score": <0-99>,
    "pathway": "<pathway>",
    "precedent_analysis": "<80 words>",
    "estimated_review_days": <number>,
    "ip_strategy": "<80 words>",
    "key_barrier": "<40 words>"
  },
  "commercial": {
    "score": <0-99>,
    "market_size_assessment": "<80 words>",
    "reimbursement_pathway": "<80 words>",
    "competitive_moat": "<60 words>",
    "revenue_potential": "<range/year>"
  },
  "competitive_intel": {
    "threat_level": "<low|medium|high>",
    "differentiation_angle": "<80 words>",
    "first_mover_window": "<estimate>"
  },
  "composite_score": <0-99>,
  "verdict": "<120 words>",
  "top_3_next_steps": ["<step>", "<step>", "<step>"]
}`;

    try {
      setAnalysisProgress("Running pharmacological + competitive analysis...");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1200,
          system: "You are a pharmaceutical analysis system. Return ONLY valid JSON. No markdown, no backticks.",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      setAnalysisProgress("Synthesizing clinical + regulatory + commercial panels...");
      const data = await response.json();
      const text = data.content?.map(i => i.type === "text" ? i.text : "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAnalysisResult(parsed);
    } catch {
      setAnalysisProgress("API unavailable - generating deterministic analysis...");
      const threatLevel = gap.competitors.length === 0 ? "low" : gap.competitors.length <= 2 ? "medium" : "high";
      setAnalysisResult({
        pharmacological: {
          score: gap.scores.evidence,
          mechanism_rationale: `${gap.molecule} (${gap.moleculeClass}) has demonstrated activity relevant to ${gap.indication} based on ${gap.evidence} evidence across ${gap.approvedIn.length} jurisdictions. The mechanistic basis involves the molecule's known pharmacological profile interacting with pathways implicated in this condition. Cross-target activity and polypharmacology suggest plausible efficacy.`,
          dose_considerations: "Dose bridging studies recommended. Existing PK data from the approved indication provides a foundation, but the new indication may require dose optimization based on the target tissue concentrations needed.",
          safety_flags: "Established safety profile from post-market surveillance. Key monitoring points from the original indication apply. New indication-specific adverse event monitoring protocol needed.",
          key_risk: "Insufficient efficacy at tolerated doses for the new indication.",
        },
        clinical: {
          score: gap.scores.regulatory,
          trial_design: `Phase II randomized, double-blind, placebo-controlled. Primary endpoint: indication-specific clinical measures. N=120-200. Duration: 24-48 weeks. Adaptive design for dose optimization. Multi-site recommended.`,
          timeline_months: gap.ptrs.remaining || 24,
          estimated_cost_cad: "$4M - $12M CAD",
          endpoint_strategy: "Primary: indication-specific clinical response. Secondary: biomarker changes, safety, quality of life, time to response.",
          recruitment_feasibility: "Multi-site recruitment recommended. Leverage existing clinical networks and patient registries.",
        },
        regulatory: {
          score: gap.scores.regulatory,
          pathway: homeCountry === "CA" ? "SNDS / SANDS (Health Canada)" : homeCountry === "US" ? "sNDA / sBLA (FDA)" : "Variation Type II",
          precedent_analysis: `Approved in ${gap.approvedIn.length} jurisdictions (${gap.approvedIn.join(", ")}). Strong regulatory precedent. New reliance frameworks may allow leveraging foreign approvals.`,
          estimated_review_days: homeCountry === "US" ? 300 : homeCountry === "CA" ? 355 : 210,
          ip_strategy: "Novel indication patent obtainable if clinical evidence demonstrates new therapeutic utility. Formulation changes strengthen IP position.",
          key_barrier: "Generic off-label substitution may limit commercial protection even with indication approval.",
        },
        commercial: {
          score: gap.scores.commercial,
          market_size_assessment: `Target population: ${gap.patientPop} globally. Competitive landscape includes ${gap.competitors.length} direct competitors. ${gap.competitors.length === 0 ? "First-mover advantage in whitespace." : "Differentiation required."}`,
          reimbursement_pathway: "Submit HTA to relevant bodies. Cost-effectiveness argument strong given generic pricing baseline.",
          competitive_moat: gap.competitors.length === 0 ? "Whitespace opportunity with no direct competition. Clinical data package creates evidence barrier." : `${gap.competitors.length} competitors active. Foundation-funded clinical data and named PI provide credibility advantage.`,
          revenue_potential: "$2M - $15M CAD/year",
        },
        competitive_intel: {
          threat_level: threatLevel,
          differentiation_angle: gap.competitors.length === 0 ? "No direct competitors identified. First-mover advantage is the primary differentiator. Speed to filing is critical." : `Differentiate through: 1) Generic cost advantage vs branded competitors, 2) Specific formulation advantages, 3) Regulatory speed via reliance pathway.`,
          first_mover_window: gap.competitors.length === 0 ? "18-36 months" : "6-12 months",
        },
        composite_score: gap.scores.composite,
        verdict: `${gap.molecule} for ${gap.indication} shows ${gap.viability.toLowerCase()} viability. PTRS: ${Math.round(gap.ptrs.ptrs * 100)}% based on ${gap.ptrs.phase} evidence in ${gap.ta} therapeutic area. ${gap.approvedIn.length}-country precedent supports filing. ${gap.competitors.length === 0 ? "Whitespace opportunity with no direct competitors." : `${gap.competitors.length} competitors active - speed is critical.`} ${gap.unmetNeed ? `High unmet need (${gap.unmetNeed.score}/100).` : ""} Recommend proceeding to pre-clinical validation.`,
        top_3_next_steps: [
          "Commission systematic review of international clinical evidence",
          `Initiate pre-submission meeting with ${homeC?.authority || "regulatory authority"}`,
          gap.competitors.length > 0 ? "Develop differentiation strategy vs " + gap.competitors[0]?.company : "File fast-track designation to secure first-mover advantage",
        ],
      });
    }
    setAnalysisProgress("");
    setAnalyzing(false);
  }, [homeCountry, selectedCompany]);

  // Toggle compare selection
  const toggleCompare = useCallback((gap) => {
    const key = gapKey(gap);
    setCompareSelection(prev => {
      if (prev.find(g => gapKey(g) === key)) return prev.filter(g => gapKey(g) !== key);
      if (prev.length >= 4) return prev;
      return [...prev, gap];
    });
  }, []);

  // ═══ STYLES ═══
  const S = {
    app: { background: "#08080d", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#e8e8f0" },
    topBar: { background: "#0c0c14", borderBottom: "1px solid #1a1a26", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
    logo: { fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#d4a853", whiteSpace: "nowrap" },
    select: { background: "#12121a", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#e8e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer", minWidth: 150 },
    card: { background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 16, cursor: "pointer", transition: "all 0.2s" },
    viewBtn: (active) => ({
      background: active ? "#d4a85320" : "#12121a", border: `1px solid ${active ? "#d4a853" : "#2a2a3e"}`,
      borderRadius: 6, padding: "5px 10px", color: active ? "#d4a853" : "#8888a8", fontSize: 11, cursor: "pointer",
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
    }),
    searchInput: {
      background: "#12121a", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#e8e8f0",
      fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 220,
    },
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* ═══ TOP BAR ═══ */}
      <div style={S.topBar}>
        <div style={S.logo}>Indication Gap Intelligence</div>
        <Tag color="#60a5fa">v2.0 + PTRS</Tag>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          <label style={{ fontSize: 11, color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>COMPANY</label>
          <select style={S.select} value={selectedCompany.id} onChange={e => setSelectedCompany(COMPANIES.find(c => c.id === e.target.value))}>
            {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name} - {c.hq}</option>)}
          </select>
          <label style={{ fontSize: 11, color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginLeft: 8 }}>HOME MARKET</label>
          <select style={S.select} value={homeCountry} onChange={e => setHomeCountry(e.target.value)}>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.authority})</option>)}
          </select>
        </div>
      </div>

      {/* ═══ STATS BAR (enhanced with PTRS + competitive) ═══ */}
      <div style={{ background: "#0c0c14", padding: "12px 20px", display: "flex", gap: 20, borderBottom: "1px solid #1a1a26", flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "MOLECULES", value: selectedCompany.molecules.length, color: "#d4a853" },
          { label: "GAPS", value: gaps.length, color: "#34d399" },
          { label: "EXCELLENT", value: gaps.filter(g => g.viability === "Excellent").length, color: "#34d399" },
          { label: "STRONG", value: gaps.filter(g => g.viability === "Strong").length, color: "#fbbf24" },
          { label: "AVG PTRS", value: `${Math.round((portfolioStats?.avgPTRS || 0) * 100)}%`, color: "#60a5fa" },
          { label: "WHITESPACE", value: gaps.filter(g => g.competitors.length === 0).length, color: "#a78bfa" },
          { label: "WATCHLIST", value: watchlist.length, color: "#d4a853" },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: 10, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button onClick={exportReport} style={{ ...S.viewBtn(false), background: "#34d39915", borderColor: "#34d39950", color: "#34d399" }}>
            EXPORT REPORT
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} style={{ ...S.viewBtn(chatOpen), background: chatOpen ? "#a78bfa20" : undefined, borderColor: chatOpen ? "#a78bfa" : undefined, color: chatOpen ? "#a78bfa" : undefined }}>
            AI CHAT
          </button>
        </div>
      </div>

      {/* ═══ VIEW SELECTOR + FILTERS ═══ */}
      <div style={{ padding: "8px 20px", background: "#0a0a10", display: "flex", gap: 6, alignItems: "center", borderBottom: "1px solid #1a1a26", flexWrap: "wrap" }}>
        {/* View tabs */}
        <span style={{ fontSize: 10, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>VIEW</span>
        {[
          ["dashboard", "CARDS"],
          ["heatmap", "HEATMAP"],
          ["comparator", "COMPARE"],
          ["portfolio", "PORTFOLIO"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => { setView(key); setSelectedGap(null); setAnalysisResult(null); }} style={S.viewBtn(view === key)}>{label}</button>
        ))}

        <div style={{ width: 1, height: 20, background: "#2a2a3e", margin: "0 6px" }} />

        {/* Viability filter */}
        <span style={{ fontSize: 10, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>FILTER</span>
        {["all", "Excellent", "Strong", "Moderate", "Low"].map(f => (
          <button key={f} onClick={() => setFilterViability(f)} style={S.viewBtn(filterViability === f)}>{f.toUpperCase()}</button>
        ))}

        <button onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
          style={{ ...S.viewBtn(showWatchlistOnly), color: showWatchlistOnly ? "#d4a853" : "#8888a8" }}>
          {showWatchlistOnly ? "\u2605" : "\u2606"} WATCHLIST
        </button>

        <div style={{ width: 1, height: 20, background: "#2a2a3e", margin: "0 6px" }} />

        {/* Sort */}
        <span style={{ fontSize: 10, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>SORT</span>
        {[["composite", "Composite"], ["evidence", "Evidence"], ["ptrs", "PTRS"], ["competitive", "Whitespace"]].map(([key, label]) => (
          <button key={key} onClick={() => setSortBy(key)} style={{
            background: sortBy === key ? "#60a5fa15" : "transparent", border: `1px solid ${sortBy === key ? "#60a5fa" : "transparent"}`,
            borderRadius: 4, padding: "3px 8px", color: sortBy === key ? "#60a5fa" : "#5555708a", fontSize: 10, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}>{label}</button>
        ))}

        {/* Search */}
        <input type="text" placeholder="Search molecules, indications..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)} style={{ ...S.searchInput, marginLeft: "auto" }} />

        {view === "detail" && (
          <button onClick={() => { setView("dashboard"); setSelectedGap(null); setAnalysisResult(null); }} style={S.viewBtn(false)}>
            BACK
          </button>
        )}
      </div>

      {/* ═══ COMPARE BAR (when selections exist) ═══ */}
      {compareSelection.length > 0 && view !== "comparator" && (
        <div style={{ padding: "8px 20px", background: "#a78bfa10", borderBottom: "1px solid #a78bfa30", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>{compareSelection.length}/4 SELECTED</span>
          {compareSelection.map(g => (
            <Tag key={gapKey(g)} color="#a78bfa">{g.molecule.split(" ")[0]}</Tag>
          ))}
          <button onClick={() => setView("comparator")} style={{ ...S.viewBtn(false), borderColor: "#a78bfa50", color: "#a78bfa", marginLeft: "auto" }}>
            COMPARE NOW
          </button>
          <button onClick={() => setCompareSelection([])} style={{ ...S.viewBtn(false), color: "#ef4444", borderColor: "#ef444440" }}>CLEAR</button>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, padding: 20, overflow: "auto", maxHeight: "calc(100vh - 200px)" }} ref={scrollRef}>

          {/* ═══ DASHBOARD VIEW ═══ */}
          {view === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
              {processedGaps.map((gap, i) => (
                <div key={i} onClick={() => { setSelectedGap(gap); setView("detail"); setAnalysisResult(null); }}
                  style={{ ...S.card, borderColor: compareSelection.find(g => gapKey(g) === gapKey(gap)) ? "#a78bfa" : "#1e1e2e", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = gap.color + "80"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = compareSelection.find(g => gapKey(g) === gapKey(gap)) ? "#a78bfa" : "#1e1e2e"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: gap.color }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <WatchlistStar gapKey={gapKey(gap)} watchlist={watchlist} toggle={toggleWatchlist} />
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{gap.molecule}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "#8888a8", marginLeft: 24 }}>{gap.moleculeClass} | {gap.ta}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PTRSGauge ptrs={gap.ptrs} />
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: gap.color }}>{gap.scores.composite}</div>
                        <Tag color={gap.color}>{gap.viability}</Tag>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#d4a853", marginBottom: 4 }}>{gap.indication}</div>
                  <div style={{ fontSize: 11, color: "#5555708a", marginBottom: 6 }}>
                    {gap.evidence} | {gap.patientPop} patients | {gap.competitors.length === 0 ? <span style={{ color: "#a78bfa" }}>WHITESPACE</span> : `${gap.competitors.length} competitors`}
                  </div>
                  {/* Unmet need badge */}
                  {gap.unmetNeed && (
                    <div style={{ fontSize: 10, color: "#ef4444", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                      UNMET NEED: {gap.unmetNeed.score}/100 - {gap.unmetNeed.gaps.slice(0, 60)}...
                    </div>
                  )}
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {COUNTRIES.map(c => <CountryPill key={c.code} code={c.code} active={gap.approvedIn.includes(c.code)} />)}
                    </div>
                  </div>
                  <ScoreBar value={gap.scores.evidence} label="EVIDENCE" color="#60a5fa" />
                  <ScoreBar value={gap.scores.breadth} label="BREADTH" color="#a78bfa" />
                  <ScoreBar value={gap.scores.regulatory} label="REGULATORY" color="#34d399" />
                  <ScoreBar value={gap.scores.commercial} label="COMMERCIAL" color="#fbbf24" />
                  <ScoreBar value={gap.competitiveScore} label="COMPETITIVE ADVANTAGE" color="#d4a853" />
                  {/* Compare checkbox */}
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={e => { e.stopPropagation(); toggleCompare(gap); }}
                      style={{
                        fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "3px 8px", borderRadius: 4, cursor: "pointer",
                        background: compareSelection.find(g => gapKey(g) === gapKey(gap)) ? "#a78bfa20" : "transparent",
                        border: `1px solid ${compareSelection.find(g => gapKey(g) === gapKey(gap)) ? "#a78bfa" : "#2a2a3e"}`,
                        color: compareSelection.find(g => gapKey(g) === gapKey(gap)) ? "#a78bfa" : "#5555708a",
                      }}>
                      {compareSelection.find(g => gapKey(g) === gapKey(gap)) ? "SELECTED" : "+ COMPARE"}
                    </button>
                  </div>
                </div>
              ))}
              {processedGaps.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "#5555708a" }}>
                  <div style={{ fontSize: 16 }}>No indication gaps match your filters.</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>Try adjusting the home market, company, or filter settings.</div>
                </div>
              )}
            </div>
          )}

          {/* ═══ FEATURE #2: HEATMAP VIEW ═══ */}
          {view === "heatmap" && (() => {
            const molecules = selectedCompany.molecules;
            const allIndications = new Set();
            const heatData = {};
            molecules.forEach(mol => {
              const indications = generateIndicationData(mol);
              indications.forEach(ind => {
                const gap = scoreGap(ind, homeCountry, mol);
                if (gap) {
                  allIndications.add(gap.indication);
                  heatData[`${mol.name}::${gap.indication}`] = gap;
                }
              });
            });
            const indicationList = [...allIndications];
            return (
              <div style={{ overflowX: "auto" }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#8888a8", letterSpacing: 2, marginBottom: 12 }}>
                  INDICATION GAP HEATMAP | {selectedCompany.name} | {COUNTRIES.find(c => c.code === homeCountry)?.name}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${indicationList.length}, minmax(80px, 1fr))`, gap: 2, fontSize: 10 }}>
                  {/* Header row */}
                  <div style={{ padding: 6, fontWeight: 600, color: "#8888a8" }} />
                  {indicationList.map(ind => (
                    <div key={ind} style={{ padding: 4, color: "#8888a8", fontFamily: "'JetBrains Mono', monospace", fontSize: 8, writingMode: "vertical-lr", transform: "rotate(180deg)", height: 120, textAlign: "left" }}>
                      {ind.length > 30 ? ind.slice(0, 28) + "..." : ind}
                    </div>
                  ))}
                  {/* Data rows */}
                  {molecules.map(mol => (
                    <Fragment key={mol.name}>
                      <div style={{ padding: "6px 8px", fontWeight: 600, fontSize: 11, color: "#e8e8f0", display: "flex", alignItems: "center", background: "#0c0c14", borderRadius: 4 }}>
                        {mol.name.split(" ")[0]}
                      </div>
                      {indicationList.map(ind => {
                        const gap = heatData[`${mol.name}::${ind}`];
                        if (!gap) return <div key={`${mol.name}-${ind}`} style={{ background: "#0a0a10", borderRadius: 3, minHeight: 32 }} />;
                        return (
                          <div key={`${mol.name}-${ind}`}
                            onClick={() => { setSelectedGap(gap); setView("detail"); setAnalysisResult(null); }}
                            style={{
                              background: `${gap.color}25`, borderRadius: 3, padding: 4, cursor: "pointer",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              border: `1px solid ${gap.color}30`, transition: "all 0.2s", minHeight: 32,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${gap.color}50`; e.currentTarget.style.transform = "scale(1.05)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${gap.color}25`; e.currentTarget.style.transform = "none"; }}
                            title={`${mol.name} -> ${ind}\nComposite: ${gap.scores.composite} | PTRS: ${Math.round(gap.ptrs.ptrs * 100)}%`}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: gap.color }}>{gap.scores.composite}</div>
                            <div style={{ fontSize: 7, color: "#8888a8" }}>{Math.round(gap.ptrs.ptrs * 100)}%</div>
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: 16, marginTop: 16, justifyContent: "center" }}>
                  {[["#34d399", "Excellent (75+)"], ["#fbbf24", "Strong (60-74)"], ["#60a5fa", "Moderate (45-59)"], ["#ef4444", "Low (<45)"]].map(([color, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: `${color}50`, border: `1px solid ${color}` }} />
                      <span style={{ fontSize: 10, color: "#8888a8", fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ═══ FEATURE #6: COMPARATOR VIEW ═══ */}
          {view === "comparator" && (
            <div>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#8888a8", letterSpacing: 2, marginBottom: 16 }}>
                SIDE-BY-SIDE COMPARISON | SELECT UP TO 4 GAPS FROM THE DASHBOARD
              </div>
              {compareSelection.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#5555708a" }}>
                  <div style={{ fontSize: 16 }}>No gaps selected for comparison.</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>Go to Cards view and click "+ COMPARE" on gaps you want to compare.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${compareSelection.length}, 1fr)`, gap: 12 }}>
                  {compareSelection.map(gap => (
                    <div key={gapKey(gap)} style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 16, position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gap.color }} />
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: gap.color, textAlign: "center" }}>{gap.scores.composite}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, textAlign: "center", marginBottom: 2 }}>{gap.molecule}</div>
                      <div style={{ fontSize: 12, color: "#d4a853", textAlign: "center", marginBottom: 12 }}>{gap.indication}</div>
                      <Tag color={gap.color}>{gap.viability}</Tag>
                      <Tag color="#60a5fa">{gap.evidence}</Tag>
                      <div style={{ marginTop: 12 }}>
                        <PTRSGauge ptrs={gap.ptrs} size="lg" />
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <ScoreBar value={gap.scores.evidence} label="EVIDENCE" color="#60a5fa" />
                        <ScoreBar value={gap.scores.breadth} label="BREADTH" color="#a78bfa" />
                        <ScoreBar value={gap.scores.regulatory} label="REGULATORY" color="#34d399" />
                        <ScoreBar value={gap.scores.commercial} label="COMMERCIAL" color="#fbbf24" />
                        <ScoreBar value={gap.competitiveScore} label="COMPETITIVE" color="#d4a853" />
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: "#8888a8" }}>
                        <div>Approved: {gap.approvedIn.length} countries</div>
                        <div>Competitors: {gap.competitors.length === 0 ? <span style={{ color: "#a78bfa" }}>None (whitespace)</span> : gap.competitors.length}</div>
                        <div>Patients: {gap.patientPop}</div>
                        <div>Time to approval: ~{gap.ptrs.remaining}mo</div>
                        {gap.unmetNeed && <div>Unmet need: {gap.unmetNeed.score}/100</div>}
                      </div>
                      {gap.competitors.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 9, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>COMPETITORS</div>
                          {gap.competitors.slice(0, 3).map((c, i) => (
                            <div key={i} style={{ fontSize: 10, color: "#8888a8", marginBottom: 2 }}>
                              {c.company}: {c.molecule} ({c.phase})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ FEATURE #7: PORTFOLIO VIEW ═══ */}
          {view === "portfolio" && portfolioStats && (
            <div>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#8888a8", letterSpacing: 2, marginBottom: 16 }}>
                PORTFOLIO INTELLIGENCE | {selectedCompany.name} | {COUNTRIES.find(c => c.code === homeCountry)?.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {/* Summary Card */}
                <div style={{ background: "linear-gradient(135deg, #12121a, #1a1a26)", border: "1px solid #d4a85340", borderRadius: 10, padding: 20, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: "#d4a853" }}>{portfolioStats.total}</div>
                      <div style={{ fontSize: 11, color: "#8888a8" }}>Total Gaps</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: "#34d399" }}>{portfolioStats.excellent}</div>
                      <div style={{ fontSize: 11, color: "#8888a8" }}>Excellent</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: "#60a5fa" }}>{Math.round(portfolioStats.avgPTRS * 100)}%</div>
                      <div style={{ fontSize: 11, color: "#8888a8" }}>Avg PTRS</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: "#a78bfa" }}>{portfolioStats.whitespace}</div>
                      <div style={{ fontSize: 11, color: "#8888a8" }}>Whitespace</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: "#fbbf24" }}>{Math.round(portfolioStats.avgComposite)}</div>
                      <div style={{ fontSize: 11, color: "#8888a8" }}>Avg Composite</div>
                    </div>
                  </div>
                </div>

                {/* TA Distribution */}
                <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#d4a853", letterSpacing: 2, marginBottom: 12 }}>THERAPEUTIC AREA DISTRIBUTION</div>
                  {portfolioStats.topTA.map(([ta, count]) => {
                    const taColors = { oncology: "#ef4444", cardiovascular: "#60a5fa", cns: "#a78bfa", metabolic: "#34d399", inflammation: "#fbbf24", respiratory: "#38bdf8", gi: "#f97316", hematology: "#ec4899", urology: "#06b6d4" };
                    return (
                      <div key={ta} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                          <span style={{ color: taColors[ta] || "#8888a8", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{ta}</span>
                          <span style={{ color: "#8888a8" }}>{count} gaps</span>
                        </div>
                        <div style={{ height: 4, background: "#1a1a26", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${(count / portfolioStats.total) * 100}%`, height: "100%", background: taColors[ta] || "#8888a8", borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phase Distribution */}
                <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", letterSpacing: 2, marginBottom: 12 }}>EVIDENCE PHASE DISTRIBUTION</div>
                  {Object.entries(portfolioStats.phaseDistribution).map(([phase, count]) => (
                    <div key={phase} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a26" }}>
                      <Tag color="#60a5fa">{phase}</Tag>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#e8e8f0" }}>{count}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, fontSize: 11, color: "#8888a8", lineHeight: 1.6 }}>
                    Phase III evidence gives the highest PTRS and fastest path to approval. Prioritize Phase III gaps with high composite scores.
                  </div>
                </div>

                {/* Competitive Overview */}
                <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#a78bfa", letterSpacing: 2, marginBottom: 12 }}>COMPETITIVE LANDSCAPE</div>
                  <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>{portfolioStats.whitespace}</div>
                      <div style={{ fontSize: 10, color: "#8888a8" }}>Whitespace</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#fbbf24" }}>{portfolioStats.total - portfolioStats.whitespace}</div>
                      <div style={{ fontSize: 10, color: "#8888a8" }}>Contested</div>
                    </div>
                  </div>
                  {gaps.filter(g => g.competitors.length === 0).slice(0, 5).map(g => (
                    <div key={gapKey(g)} onClick={() => { setSelectedGap(g); setView("detail"); setAnalysisResult(null); }}
                      style={{ padding: "6px 0", borderBottom: "1px solid #1a1a26", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{g.molecule.split(" ")[0]}</div>
                        <div style={{ fontSize: 10, color: "#d4a853" }}>{g.indication}</div>
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: g.color }}>{g.scores.composite}</div>
                    </div>
                  ))}
                </div>

                {/* Top 5 Opportunities */}
                <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20, gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", letterSpacing: 2, marginBottom: 12 }}>TOP 5 PORTFOLIO OPPORTUNITIES</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
                    {gaps.slice(0, 5).map((g, i) => (
                      <div key={i} onClick={() => { setSelectedGap(g); setView("detail"); setAnalysisResult(null); }}
                        style={{ background: "#0c0c14", border: `1px solid ${g.color}30`, borderRadius: 8, padding: 12, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8888a8" }}>#{i + 1}</div>
                          <PTRSGauge ptrs={g.ptrs} />
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{g.molecule}</div>
                        <div style={{ fontSize: 12, color: "#d4a853", marginBottom: 4 }}>{g.indication}</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <Tag color={g.color}>{g.viability} {g.scores.composite}</Tag>
                          {g.competitors.length === 0 && <Tag color="#a78bfa">WHITESPACE</Tag>}
                          {g.unmetNeed && <Tag color="#ef4444">UNMET {g.unmetNeed.score}</Tag>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ DETAIL VIEW (enhanced with competitive intel) ═══ */}
          {view === "detail" && selectedGap && (
            <div>
              {/* Header */}
              <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 12, padding: 24, marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${selectedGap.color}, #d4a853)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8888a8", letterSpacing: 2, marginBottom: 4 }}>INDICATION GAP ANALYSIS</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <WatchlistStar gapKey={gapKey(selectedGap)} watchlist={watchlist} toggle={toggleWatchlist} />
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{selectedGap.molecule}</div>
                    </div>
                    <div style={{ fontSize: 14, color: "#8888a8" }}>{selectedGap.moleculeClass} | {selectedGap.ta?.toUpperCase()} | {selectedCompany.molecules.find(m => m.name === selectedGap.molecule)?.originalIndication}</div>
                    <div style={{ fontSize: 16, color: "#d4a853", fontWeight: 600, marginTop: 8 }}>{selectedGap.indication}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <PTRSGauge ptrs={selectedGap.ptrs} size="lg" />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: selectedGap.color }}>{selectedGap.scores.composite}</div>
                      <Tag color={selectedGap.color}>{selectedGap.viability}</Tag>
                    </div>
                  </div>
                </div>
                {/* Country pills */}
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>APPROVED IN</span>
                  {COUNTRIES.map(c => <CountryPill key={c.code} code={c.code} active={selectedGap.approvedIn.includes(c.code)} />)}
                </div>
                {/* Score bars */}
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                  <ScoreBar value={selectedGap.scores.evidence} label="EVIDENCE" color="#60a5fa" />
                  <ScoreBar value={selectedGap.scores.breadth} label="BREADTH" color="#a78bfa" />
                  <ScoreBar value={selectedGap.scores.regulatory} label="REGULATORY" color="#34d399" />
                  <ScoreBar value={selectedGap.scores.commercial} label="COMMERCIAL" color="#fbbf24" />
                  <ScoreBar value={selectedGap.competitiveScore} label="COMPETITIVE" color="#d4a853" />
                </div>
              </div>

              {/* Competitive Intelligence Panel */}
              {selectedGap.competitors.length > 0 && (
                <div style={{ background: "#12121a", border: "1px solid #ef444430", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#ef4444", letterSpacing: 2, marginBottom: 10 }}>
                    COMPETITIVE PIPELINE RADAR | {selectedGap.competitors.length} COMPETITORS
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                    {selectedGap.competitors.map((c, i) => (
                      <div key={i} style={{ background: "#0c0c14", borderRadius: 6, padding: 10, border: "1px solid #1e1e2e" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e8e8f0" }}>{c.company}</div>
                        <div style={{ fontSize: 11, color: "#d4a853" }}>{c.molecule}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                          <Tag color={c.phase === "Approved" ? "#34d399" : c.phase.includes("III") ? "#fbbf24" : "#60a5fa"}>{c.phase}</Tag>
                          <Tag color="#8888a8">{c.mechanism}</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unmet Need Panel */}
              {selectedGap.unmetNeed && (
                <div style={{ background: "#12121a", border: "1px solid #ef444430", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#ef4444", letterSpacing: 2 }}>UNMET MEDICAL NEED</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#ef4444" }}>{selectedGap.unmetNeed.score}/100</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#8888a8", marginBottom: 4 }}><strong style={{ color: "#e8e8f0" }}>Current SoC:</strong> {selectedGap.unmetNeed.currentSoC}</div>
                  <div style={{ fontSize: 12, color: "#8888a8" }}><strong style={{ color: "#e8e8f0" }}>Key Gaps:</strong> {selectedGap.unmetNeed.gaps}</div>
                </div>
              )}

              {/* Run Analysis Button */}
              {!analysisResult && !analyzing && (
                <button onClick={() => runL99Analysis(selectedGap)} style={{
                  width: "100%", padding: 16, background: "linear-gradient(135deg, #d4a85320, #34d39920)",
                  border: "1px solid #d4a85360", borderRadius: 10, color: "#d4a853", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", marginBottom: 16, fontFamily: "'DM Sans', sans-serif",
                }}>
                  Run L99 Multi-Panel Analysis (Pharma + Clinical + Regulatory + Commercial + Competitive Intel)
                </button>
              )}

              {analyzing && (
                <div style={{ background: "#12121a", border: "1px solid #d4a85340", borderRadius: 10, padding: 24, marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 12, animation: "pulse 1.5s infinite" }}>&#x1F9E0;</div>
                  <div style={{ fontSize: 14, color: "#d4a853", fontWeight: 600, marginBottom: 6 }}>{analysisProgress}</div>
                  <div style={{ fontSize: 12, color: "#8888a8" }}>Running pharmacological, clinical, regulatory, commercial, and competitive expert panels...</div>
                  <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <div style={{ display: "grid", gap: 12 }}>
                  {/* Composite Verdict */}
                  <div style={{ background: "linear-gradient(135deg, #12121a, #1a1a26)", border: "1px solid #d4a85340", borderRadius: 10, padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#8888a8", letterSpacing: 2, marginBottom: 4 }}>L99 COMPOSITE VERDICT</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, fontWeight: 700, color: analysisResult.composite_score >= 70 ? "#34d399" : analysisResult.composite_score >= 50 ? "#fbbf24" : "#ef4444" }}>
                      {analysisResult.composite_score}<span style={{ fontSize: 20, color: "#5555708a" }}>/99</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#e8e8f0", lineHeight: 1.7, maxWidth: 700, margin: "12px auto 0" }}>{analysisResult.verdict}</p>
                  </div>

                  {/* 5-Panel Grid (4 original + competitive intel) */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                    {/* Pharmacological */}
                    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", letterSpacing: 2 }}>PHARMACOLOGICAL</div>
                          <div style={{ fontSize: 12, color: "#8888a8" }}>Mechanism & Safety</div>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#60a5fa" }}>{analysisResult.pharmacological.score}</div>
                      </div>
                      <p style={{ fontSize: 12, color: "#b8b8c8", lineHeight: 1.65, marginBottom: 10 }}>{analysisResult.pharmacological.mechanism_rationale}</p>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>DOSE CONSIDERATIONS</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.pharmacological.dose_considerations}</p>
                      </div>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>SAFETY FLAGS</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.pharmacological.safety_flags}</p>
                      </div>
                      <div style={{ background: "#ef444415", borderRadius: 6, padding: 8 }}>
                        <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>KEY RISK</div>
                        <p style={{ fontSize: 11, color: "#ef4444", lineHeight: 1.4 }}>{analysisResult.pharmacological.key_risk}</p>
                      </div>
                    </div>

                    {/* Clinical */}
                    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", letterSpacing: 2 }}>CLINICAL</div>
                          <div style={{ fontSize: 12, color: "#8888a8" }}>Trial Design & Execution</div>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#34d399" }}>{analysisResult.clinical.score}</div>
                      </div>
                      <p style={{ fontSize: 12, color: "#b8b8c8", lineHeight: 1.65, marginBottom: 10 }}>{analysisResult.clinical.trial_design}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                        <div style={{ background: "#0a0a10", borderRadius: 6, padding: 8, textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace" }}>TIMELINE</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#34d399" }}>{analysisResult.clinical.timeline_months} mo</div>
                        </div>
                        <div style={{ background: "#0a0a10", borderRadius: 6, padding: 8, textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace" }}>EST. COST</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24" }}>{analysisResult.clinical.estimated_cost_cad}</div>
                        </div>
                      </div>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>ENDPOINTS</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.clinical.endpoint_strategy}</p>
                      </div>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10 }}>
                        <div style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>RECRUITMENT</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.clinical.recruitment_feasibility}</p>
                      </div>
                    </div>

                    {/* Regulatory */}
                    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#a78bfa", letterSpacing: 2 }}>REGULATORY</div>
                          <div style={{ fontSize: 12, color: "#8888a8" }}>Pathway & IP</div>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>{analysisResult.regulatory.score}</div>
                      </div>
                      <div style={{ background: "#a78bfa15", borderRadius: 6, padding: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>PATHWAY</div>
                        <p style={{ fontSize: 13, color: "#e8e8f0", fontWeight: 600 }}>{analysisResult.regulatory.pathway}</p>
                      </div>
                      <p style={{ fontSize: 12, color: "#b8b8c8", lineHeight: 1.65, marginBottom: 10 }}>{analysisResult.regulatory.precedent_analysis}</p>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 8, textAlign: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace" }}>EST. REVIEW</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>{analysisResult.regulatory.estimated_review_days} days</div>
                      </div>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>IP STRATEGY</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.regulatory.ip_strategy}</p>
                      </div>
                      <div style={{ background: "#ef444415", borderRadius: 6, padding: 8 }}>
                        <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>KEY BARRIER</div>
                        <p style={{ fontSize: 11, color: "#ef4444", lineHeight: 1.4 }}>{analysisResult.regulatory.key_barrier}</p>
                      </div>
                    </div>

                    {/* Commercial */}
                    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24", letterSpacing: 2 }}>COMMERCIAL</div>
                          <div style={{ fontSize: 12, color: "#8888a8" }}>Market & Revenue</div>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#fbbf24" }}>{analysisResult.commercial.score}</div>
                      </div>
                      <p style={{ fontSize: 12, color: "#b8b8c8", lineHeight: 1.65, marginBottom: 10 }}>{analysisResult.commercial.market_size_assessment}</p>
                      <div style={{ background: "#fbbf2415", borderRadius: 6, padding: 10, textAlign: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: "#5555708a", fontFamily: "'JetBrains Mono', monospace" }}>REVENUE POTENTIAL</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fbbf24" }}>{analysisResult.commercial.revenue_potential}</div>
                      </div>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>REIMBURSEMENT</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.commercial.reimbursement_pathway}</p>
                      </div>
                      <div style={{ background: "#0a0a10", borderRadius: 6, padding: 10 }}>
                        <div style={{ fontSize: 10, color: "#d4a853", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>COMPETITIVE MOAT</div>
                        <p style={{ fontSize: 11, color: "#8888a8", lineHeight: 1.5 }}>{analysisResult.commercial.competitive_moat}</p>
                      </div>
                    </div>

                    {/* NEW: Competitive Intelligence Panel */}
                    {analysisResult.competitive_intel && (
                      <div style={{ background: "#12121a", border: "1px solid #ef444430", borderRadius: 10, padding: 20, gridColumn: "1 / -1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#ef4444", letterSpacing: 2 }}>COMPETITIVE INTELLIGENCE</div>
                            <div style={{ fontSize: 12, color: "#8888a8" }}>Threat Assessment & Differentiation</div>
                          </div>
                          <Tag color={analysisResult.competitive_intel.threat_level === "low" ? "#34d399" : analysisResult.competitive_intel.threat_level === "medium" ? "#fbbf24" : "#ef4444"}>
                            THREAT: {analysisResult.competitive_intel.threat_level?.toUpperCase()}
                          </Tag>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div style={{ background: "#0a0a10", borderRadius: 6, padding: 12 }}>
                            <div style={{ fontSize: 10, color: "#d4a853", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>DIFFERENTIATION ANGLE</div>
                            <p style={{ fontSize: 12, color: "#b8b8c8", lineHeight: 1.6 }}>{analysisResult.competitive_intel.differentiation_angle}</p>
                          </div>
                          <div style={{ background: "#0a0a10", borderRadius: 6, padding: 12 }}>
                            <div style={{ fontSize: 10, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>FIRST-MOVER WINDOW</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#a78bfa", marginTop: 8 }}>{analysisResult.competitive_intel.first_mover_window}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Steps */}
                  <div style={{ background: "linear-gradient(135deg, #d4a85310, #34d39910)", border: "1px solid #d4a85340", borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#d4a853", letterSpacing: 2, marginBottom: 12 }}>TOP 3 NEXT STEPS</div>
                    {analysisResult.top_3_next_steps?.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#d4a853", background: "#d4a85315",
                          width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, flexShrink: 0,
                        }}>{i + 1}</div>
                        <p style={{ fontSize: 13, color: "#e8e8f0", lineHeight: 1.6 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ FEATURE #4: AI CHAT PANEL ═══ */}
        {chatOpen && (
          <div style={{
            width: 380, background: "#0c0c14", borderLeft: "1px solid #1a1a26", display: "flex", flexDirection: "column",
            maxHeight: "calc(100vh - 200px)", position: "sticky", top: 0,
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a26", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>AI Intelligence Assistant</div>
                <div style={{ fontSize: 10, color: "#5555708a" }}>Natural Language Querying</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#5555708a", cursor: "pointer", fontSize: 16 }}>x</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {chatMessages.length === 0 && (
                <div style={{ padding: 16, textAlign: "center", color: "#5555708a" }}>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>Ask about your indication gaps</div>
                  <div style={{ fontSize: 11 }}>Try: "What are the best opportunities?" or "Show PTRS analysis" or "Which gaps have no competitors?"</div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: 8, padding: 10, borderRadius: 8,
                  background: msg.role === "user" ? "#a78bfa15" : "#12121a",
                  border: `1px solid ${msg.role === "user" ? "#a78bfa30" : "#1e1e2e"}`,
                }}>
                  <div style={{ fontSize: 9, color: msg.role === "user" ? "#a78bfa" : "#34d399", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    {msg.role === "user" ? "YOU" : "AI"}
                  </div>
                  <div style={{ fontSize: 12, color: "#e8e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ padding: 10, textAlign: "center", color: "#a78bfa", fontSize: 12 }}>Analyzing...</div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #1a1a26", display: "flex", gap: 8 }}>
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                placeholder="Ask about gaps, PTRS, competitors..."
                style={{ flex: 1, background: "#12121a", border: "1px solid #2a2a3e", borderRadius: 6, padding: "8px 10px", color: "#e8e8f0", fontSize: 12, outline: "none" }} />
              <button onClick={sendChatMessage} disabled={chatLoading}
                style={{ background: "#a78bfa20", border: "1px solid #a78bfa50", borderRadius: 6, padding: "8px 12px", color: "#a78bfa", cursor: "pointer", fontSize: 12 }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
