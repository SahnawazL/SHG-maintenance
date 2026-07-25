// Real SHG directory data, manually captured from the government NRLM portal
// (preprodmis.lokos.in). This mirrors the site's own hierarchy: State -> District
// -> Block -> Grampanchayat -> Village -> SHG Group -> member count.
//
// IMPORTANT: only Cachar > Silchar > Berenga > Berengapti / Berengaptii currently
// have real, verified group-level data (member counts cross-checked against the
// site's own totals: Berengapti = 174, Berengaptii = 440 — both match exactly).
// Every other Block / Grampanchayat listed below is real (from the site's own
// summary tables) but has no group-level data filled in yet, so it will show as
// empty in the picker — that's intentional, not a bug. Use manual typing for those
// until more villages get added here.

export const SHG_DIRECTORY = {
  Assam: {
    Cachar: {
      // Real block list for Cachar district (from the site's block-summary table).
      // Only Silchar has Grampanchayat/Village/Group data filled in so far.
      Banskandi: {},
      Binnakandi: {},
      Borjalenga: {},
      Borkhola: {},
      Kalain: {},
      Katigora: {},
      Lakhipur: {},
      Narsingpur: {},
      Palonghat: {},
      Rajabazar: {},
      Salchapra: {},
      Silchar: {
        // Real Grampanchayat list for Silchar block. Only Berenga has
        // village/group data filled in so far.
        Ambikapur: {},
        "Baghadahar Borjurai": {},
        Berenga: {
          Berengapti: [
            ["ANJALI SHG", 12],
            ["FORIDA SHG", 10],
            ["HASNA S.H.G", 11],
            ["HONUMAN SELF HELP GROUP", 13],
            ["JUHI SHG", 14],
            ["KUSHI SHG", 11],
            ["MADHUMITA SELF HELP GROUP", 11],
            ["MAHEK S.H.G", 16],
            ["MOON SHG", 11],
            ["RAKHI SELF HELP GROUP", 10],
            ["RATNAGIRI SELF HELP GROUP", 12],
            ["RED ROSE SELF HELP GROUP", 12],
            ["RUPALY SHG", 11],
            ["SUHANA SHG", 10],
            ["VARSHA SHG", 10],
          ],
          Berengaptii: [
            ["ABIDA SHG", 10],
            ["ALI SAHA SHG", 6],
            ["ARMIN S.H.G", 12],
            ["BEST SHG", 10],
            ["DURGA MANDAL SELF HELF GROUP", 13],
            ["GREEN BIPLOB SHG", 13],
            ["GULAF SELF HELP GROUP", 13],
            ["JANNAT SHG", 10],
            ["JANOPRIYA MOHILA SELF HELP GROUP BERENGA PT2", 10],
            ["JASMIN SHG", 8],
            ["JORNA SELF HELP GROUP", 10],
            ["JOY LAKHI SELF HELP GROUP", 12],
            ["LAXMI SHG", 12],
            ["M/S. ROYAL SELF HELP GROUP", 10],
            ["MILON SELF HELP GROUP", 12],
            ["MORIOM SHG", 7],
            ["MUSKAN", 12],
            ["NABO RATNA SELF HELP GROUP", 10],
            ["RADHA RANI SHG", 15],
            ["REMA S.H.G", 10],
            ["ROSE SHG", 10],
            ["ROSHNI SELF HELP GROUP", 10],
            ["ROSNI SELF HELP GROUP", 10],
            ["RUHI SHG", 9],
            ["RUHON S.H.G", 11],
            ["RUMI SELF HELP GROUP", 11],
            ["RUMI SHG", 10],
            ["SADIYA SHG", 10],
            ["SAFALI SELF HELP GROUP", 14],
            ["SAHANAJ SELF HELP GROUP", 10],
            ["SAHIL S.H.G", 13],
            ["SAMA SELF HELP GROUP", 11],
            ["SHIBAM SELF HELP GROUP", 12],
            ["SHRISHTI SHG", 10],
            ["SNEHA SELP HELF GROUP", 11],
            ["SOHELI SHG", 12],
            ["SONY S.H.G", 10],
            ["SUHAN SELF HELP GROUP", 10],
            ["SUN SELF HELP GROUP", 11],
            ["TAMANNA SHG", 10],
            ["UJJAL SELF HELP GROUP", 10],
          ],
        },
        Bhajantipur: {},
        Ghungoor: {},
        Kanakpur: {},
        Madhurbond: {},
        Meherpur: {},
        "Neairgram Bagpur": {},
        "Ramnagar Tarapur": {},
        Tarapur: {},
        Tupkhana: {},
      },
      Sonai: {},
      Tapang: {},
      Udharbond: {},
    },
  },
};

// Flattens the directory into a single searchable list:
// [{ name, members, path: "Village, Grampanchayat, Block, District, State" }, ...]
// Used to power the "type to search" autocomplete on the SHG name field.
export function flattenDirectory(dir = SHG_DIRECTORY) {
  const results = [];
  function walk(node, crumbs) {
    if (Array.isArray(node)) {
      // node is a list of [groupName, memberCount] tuples at a Village level
      node.forEach(([name, members]) => {
        results.push({ name, members, path: crumbs.slice().reverse().join(", ") });
      });
      return;
    }
    if (node && typeof node === "object") {
      Object.entries(node).forEach(([key, child]) => walk(child, [key, ...crumbs]));
    }
  }
  walk(dir, []);
  return results;
}
