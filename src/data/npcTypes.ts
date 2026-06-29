export interface NpcStatBlock {
  M: number;
  WS: number;
  BS: number;
  S: number;
  T: number;
  I: number;
  Ag: number;
  Dex: number;
  Int: number;
  WP: number;
  Fel: number;
  W: number;
}

export interface NpcTemplate {
  id: string;
  name: string;
  isNpc: boolean;
  description?: string;
  members?: readonly {
    id: string;
    name: string;
  }[];
  category: string;
  group?: string;
  count?: number;
  tags: readonly string[];
  statBlock: NpcStatBlock;
  skills?: readonly string[];
  talents?: readonly string[];
  trappings?: readonly string[];
}
