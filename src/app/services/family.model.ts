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
  job: string = '';
  desc: string = '';
  photo: string = '';
  dod: string = '';

  profile: string = '';
  span: string = '';
  nclass: string = '';
  pnode: Node = null;
  visible: boolean = false;
  family: Family = null;

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
  job: '',
  desc: '',
  photo: '',
  dod: ''
}

export const FAMILY = {
  version: '',
  date: '',
  generation: '',
  iddom: '',
  nodes: [],
  children: []
}

export class Family {
  version: string = '';
  date: string = '';
  generation: string = '';
  iddom: string = '';
  nodes: Node[] = [];
  children: Family[] = [];
}
