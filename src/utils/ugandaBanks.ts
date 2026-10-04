// Regulated Commercial Banks, Credit Institutions, and Microfinance Deposit-taking Institutions (MDIs) in Uganda (Bank of Uganda Licensed)

export interface UgandaBank {
  name: string;
  code: string;
  type: 'Commercial Bank' | 'Credit Institution' | 'Microfinance Institution' | 'Development Bank';
  popularBranches: string[];
}

export const UGANDA_BANKS: UgandaBank[] = [
  {
    name: 'Stanbic Bank Uganda',
    code: 'SBU',
    type: 'Commercial Bank',
    popularBranches: ['Main Branch (Crested Towers)', 'Forest Mall Lugogo', 'Garden City', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Entebbe', 'Masaka', 'Fort Portal'],
  },
  {
    name: 'Centenary Rural Development Bank (Centenary Bank)',
    code: 'CERUDEB',
    type: 'Commercial Bank',
    popularBranches: ['Mapeera House (Kampala)', 'Namirembe Road', 'Entebbe Road', 'Mukono', 'Masaka', 'Mbarara', 'Jinja', 'Gulu', 'Soroti', 'Hoima', 'Kabale'],
  },
  {
    name: 'Absa Bank Uganda',
    code: 'ABSA',
    type: 'Commercial Bank',
    popularBranches: ['Hannington Road (Head Office)', 'Lugogo Mall', 'Acacia Mall', 'Jinja', 'Mbarara', 'Gulu', 'Mbale', 'Entebbe'],
  },
  {
    name: 'Standard Chartered Bank Uganda',
    code: 'SCB',
    type: 'Commercial Bank',
    popularBranches: ['Speke Road', 'Lugogo', 'Garden City', 'Forest Mall', 'Village Mall Bugolobi'],
  },
  {
    name: 'DFCU Bank',
    code: 'DFCU',
    type: 'Commercial Bank',
    popularBranches: ['DFCU Towers (Kyadondo)', 'Acacia', 'Nakivubo', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Mbale'],
  },
  {
    name: 'Equity Bank Uganda',
    code: 'EQUITY',
    type: 'Commercial Bank',
    popularBranches: ['Church House (Kampala)', 'Oasis Mall', 'Katwe', 'Wandegeya', 'Kabalagala', 'Mukono', 'Jinja', 'Mbarara', 'Hoima'],
  },
  {
    name: 'PostBank Uganda',
    code: 'PBU',
    type: 'Commercial Bank',
    popularBranches: ['Nkrumah Road (Head Office)', 'City Branch', 'Wandegeya', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Soroti', 'Lira'],
  },
  {
    name: 'Housing Finance Bank',
    code: 'HFB',
    type: 'Commercial Bank',
    popularBranches: ['Investment House (Wampewo)', 'Kololo', 'Ntinda', 'Mukono', 'Mbarara', 'Gulu', 'Jinja', 'Mbale'],
  },
  {
    name: 'Bank of Africa Uganda',
    code: 'BOA',
    type: 'Commercial Bank',
    popularBranches: ['BOA House (JinJa Road)', 'Oasis Mall', 'Ntinda', 'Mukono', 'Mbarara', 'Arua', 'Gulu'],
  },
  {
    name: 'Diamond Trust Bank (DTB Uganda)',
    code: 'DTB',
    type: 'Commercial Bank',
    popularBranches: ['DTB Centre (Kampala Road)', 'Oasis Mall', 'Kabalagala', 'Ntinda', 'Jinja', 'Mbarara'],
  },
  {
    name: 'KCB Bank Uganda',
    code: 'KCB',
    type: 'Commercial Bank',
    popularBranches: ['Commercial Plaza (Kampala Rd)', 'Oasis Mall', 'Forest Mall', 'Jinja', 'Mbarara', 'Gulu', 'Hoima'],
  },
  {
    name: 'I&M Bank Uganda',
    code: 'IMB',
    type: 'Commercial Bank',
    popularBranches: ['Kingdom Kampala', 'Acacia Mall', 'Jinja', 'Mbarara', 'Kabale'],
  },
  {
    name: 'NCBA Bank Uganda',
    code: 'NCBA',
    type: 'Commercial Bank',
    popularBranches: ['Rwenzori Towers', 'Village Mall Bugolobi', 'Lugogo'],
  },
  {
    name: 'Ecobank Uganda',
    code: 'ECO',
    type: 'Commercial Bank',
    popularBranches: ['Parliament Avenue (Head Office)', 'Bombo Road', 'Lugogo', 'Mbarara', 'Jinja'],
  },
  {
    name: 'Finance Trust Bank',
    code: 'FTB',
    type: 'Commercial Bank',
    popularBranches: ['TWED Plaza (Lumumba Ave)', 'Katwe', 'Owino', 'Mukono', 'Masaka', 'Mbarara', 'Mbale', 'Iganga'],
  },
  {
    name: 'Cairo Bank Uganda',
    code: 'CBU',
    type: 'Commercial Bank',
    popularBranches: ['Greenland Towers (Kampala Rd)', 'Kikuubo', 'Jinja', 'Mbarara'],
  },
  {
    name: 'United Bank for Africa (UBA Uganda)',
    code: 'UBA',
    type: 'Commercial Bank',
    popularBranches: ['Speke Road', 'Mukwano Mall', 'Jinja', 'Mbarara'],
  },
  {
    name: 'Bank of Baroda Uganda',
    code: 'BOBU',
    type: 'Commercial Bank',
    popularBranches: ['Baroda House (Kampala Rd)', 'Railway Station', 'Mukono', 'Jinja', 'Mbarara', 'Mbale', 'Iganga'],
  },
  {
    name: 'Guaranty Trust Bank (GTBank Uganda)',
    code: 'GTB',
    type: 'Commercial Bank',
    popularBranches: ['Kimathi Avenue', 'Nakivubo', 'Mbarara'],
  },
  {
    name: 'Tropical Bank Uganda',
    code: 'TBL',
    type: 'Commercial Bank',
    popularBranches: ['Tropical Bank Building (Kampala Rd)', 'Kikuubo', 'Jinja', 'Masaka', 'Mbarara'],
  },
  {
    name: 'Bank of India Uganda',
    code: 'BOI',
    type: 'Commercial Bank',
    popularBranches: ['Jinja Road', 'Downtown Kampala'],
  },
  {
    name: 'ABC Capital Bank',
    code: 'ABC',
    type: 'Commercial Bank',
    popularBranches: ['Colville Street', 'Kikuubo'],
  },
  {
    name: 'Citibank Uganda',
    code: 'CITI',
    type: 'Commercial Bank',
    popularBranches: ['Ternan Avenue (Nakasero)'],
  },
  {
    name: 'Pride Microfinance (MDI)',
    code: 'PRIDE',
    type: 'Microfinance Institution',
    popularBranches: ['Metropole House', 'Katwe', 'Wandegeya', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Masaka'],
  },
  {
    name: 'Opportunity Bank Uganda',
    code: 'OBU',
    type: 'Credit Institution',
    popularBranches: ['Kamwokya', 'Kabalagala', 'Mukono', 'Jinja', 'Masaka', 'Mbarara'],
  },
  {
    name: 'FINCA Uganda (MDI)',
    code: 'FINCA',
    type: 'Microfinance Institution',
    popularBranches: ['Acacia Avenue', 'Katwe', 'Mukono', 'Jinja', 'Mbarara', 'Gulu'],
  },
  {
    name: 'Uganda Development Bank (UDB)',
    code: 'UDB',
    type: 'Development Bank',
    popularBranches: ['Rwenzori Towers (Nakasero)'],
  },
];
