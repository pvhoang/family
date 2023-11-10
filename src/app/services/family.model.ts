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
  pnode: any = null;
  visible: boolean = false;

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
