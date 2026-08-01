// Real SHG member rosters, transcribed exactly from the official ASRLM
// "SHG Member Search" portal (screenshots shared by the app owner). Keyed
// by SHG code, since SHG names alone are not guaranteed unique across
// villages.
//
// Each member entry mirrors the portal's own fields:
//   name         — member's full name, as shown on the portal
//   guardianName — father's/husband's name, as shown on the portal
//   memberId     — the portal's numeric member ID
//
// Add more SHGs here as roster screenshots come in — same shape, keyed by
// SHG code. This file is entirely optional at runtime: if a picked SHG has
// no matching roster entry, the app falls back to manual name entry exactly
// as it did before this file existed.
export const MEMBER_ROSTERS = {
  "4002671": {
    shgName: "MILON SELF HELP GROUP",
    district: "CACHAR",
    block: "SILCHAR",
    gp: "BERENGA",
    village: "BERENGAPTII",
    members: [
      { name: "ALFA BEGUM LASKAR", guardianName: "SAHAB UDDIN LAKAR", memberId: "40025380695" },
      { name: "ANJANA BEGUM LASKAR", guardianName: "MEJAJUN RAHMAN LASKAR", memberId: "40025380703" },
      { name: "BEGAM MACHUMA PARBIN LASKAR", guardianName: "KABUL HUSSAIN LASKAR", memberId: "40025380669" },
      { name: "FULARA BEGUM LASKAR", guardianName: "SAIDUL RAHMAN LASKAR", memberId: "40025380719" },
      { name: "JANIFA AKTAR LASKAR", guardianName: "ABUL HUSSAIN LASKAR", memberId: "40025380726" },
      { name: "JASMIN SULTANA LASKAR", guardianName: "ABDUL MALIK LASKAR", memberId: "40025380735" },
      { name: "MALLIKA BEGUM LASKAR", guardianName: "IDRIS ALI LASKAR", memberId: "40025380742" },
      { name: "RAHIMA BEGUM LASKAR", guardianName: "HOBIBUR RAHMAN LASKAR", memberId: "40025380761" },
      { name: "RANU BEGUM LASKAR", guardianName: "JALAL UDDIN LASKAR", memberId: "40025380774" },
      { name: "SAHINA BEGUM LASKAR", guardianName: "REBUL HUSSAIN LASKAR", memberId: "40025380788" },
      { name: "SAJONA BEGUM CHOUDHURY", guardianName: "ZIAUR RAHMAN BARBHUIYA", memberId: "40025380676" },
      { name: "SHALLY BEGUM BARBHUIYA", guardianName: "ATAUR RAHMAN BARBHUIYA", memberId: "40025380682" },
    ],
  },
  "4002671498": {
    shgName: "REMA S.H.G",
    district: "CACHAR",
    block: "SILCHAR",
    gp: "BERENGA",
    village: "BERENGAPTII",
    members: [
      { name: "BULI BEGUM LASKAR", guardianName: "KHAJEN UDDIN LASKAR", memberId: "40023699244" },
      { name: "KALPANA BEGUM LASKAR", guardianName: "SUJON UDDIN LASKAR", memberId: "40023699259" },
      { name: "MAFIJA BEGUM CHOUDHURY", guardianName: "MOTIBUR RAHMAN CHOUDHRY", memberId: "40023699263" },
      { name: "MONJILA BEGUM LASKAR", guardianName: "LILU LASKAR", memberId: "40023699271" },
      { name: "RUBI BEGUM LASKAR", guardianName: "MAJAKKIR HUSSAIN LASKAR", memberId: "40023699285" },
      { name: "SAYMA BEGUM LASKAR", guardianName: "SHILU LASKAR", memberId: "40023699292" },
      { name: "SULTANA BEGUM LASKAR", guardianName: "ASIK UDDIN LASKAR", memberId: "40023699302" },
      { name: "SUMON BEGUM LASKAR", guardianName: "HUJAIL AHMED LASKAR", memberId: "40023699318" },
      { name: "TARUNA BEGUM LASKAR", guardianName: "RANJU LASKAE", memberId: "40023699325" },
      { name: "YESINARA BEGUM LASKAR", guardianName: "MASTAK AHMED LASKAR", memberId: "40023699339" },
    ],
  },
};

// Looks up a roster by SHG name (case-insensitive exact match). Returns
// null if no roster has been transcribed for that SHG yet — callers should
// fall back to manual entry in that case, not treat null as an error.
export function findRosterByName(shgName) {
  const q = (shgName || "").trim().toLowerCase();
  if (!q) return null;
  return Object.values(MEMBER_ROSTERS).find((r) => r.shgName.toLowerCase() === q) || null;
}
