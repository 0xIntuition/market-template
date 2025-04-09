export interface Entry {
  term_id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  totalAssets: string
  totalShares: string
  createdAt: string;
  creator: string;
  numSubEntries?: number;
  subEntries?: SubEntry[];
}

export interface SubEntry {
  term_id: string;
  entryId: string;
  name: string;
  description: string;
  image: string;
  url: string;
  totalAssets: string
  totalShares: string
  createdAt: string;
  creator: string;
  // Let's not get too crazy... yet
  // numSubEntries?: number;
  // subEntries?: SubEntry[];
}

