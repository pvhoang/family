export class Node {
  relationship: string = '';
  name: string = '';
  level: string = '';
  nick: string = '';
  gender: string = '';
  yob: string = '';
  yod: string = '';
  pob: string = '';
  pod: string = '';
  por: string = '';
  desc: string = '';
}

export const NODE = {
  relationship: '',
  name: '',
  level: '',
  nick: '',
  gender: '',
  yob: '',
  yod: '',
  pob: '',
  pod: '',
  por: '',
  desc: ''
}

export class Family {
  nodes: Node[] = [];
  children: Family[] = [];
}
