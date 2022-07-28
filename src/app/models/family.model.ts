export class Node {
  id: string;
  relationship: string;
  name: string;
  nick: string;
  gender: string;
  yob: string;
  yod: string;
  pob: string;
  pod: string;
  por: string;
}

export class Family {
  nodes: Node[] = [];
  children: Family[] = [];
}
