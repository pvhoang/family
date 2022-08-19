export class Node {
  id: string = '';
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
  dod: string = '';
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
  desc: '',
  dod: ''
}

export const FAMILY = {
  generation: '',
  iddom: '',
  nodes: [],
  children: []
}

export class Family {
  generation: string = '';
  iddom: string = '';
  nodes: Node[] = [];
  children: Family[] = [];
}
