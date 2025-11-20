import {atom } from 'recoil';

interface Genesys {
  userId: string ;
  token: string | null;
  email: string | null;
  name: string;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  isSupervisor: boolean;
  isAdmin: boolean;
  isListenOnly: boolean;
  organization: string | null;
  roles: string[];
  gSocket?: any;
}

export const genesysState = atom<Genesys>({
  key: 'genesysState',
  default: {
    userId: "",
    token: null,
    email: null,
    name: "",
    isAuthenticated: false,
    isLoggedIn: false,
    isSupervisor: false,
    isAdmin: false,
    isListenOnly: false,
    organization: null,
    roles: [],
    gSocket: null,
  },
});
interface Calls {
  calls: Call[];
  activeCall: Call | null;
}
interface Call {
  isEmergency: boolean;
  userId: string;
  conversationId: string;
  callerName: string | null;
  number: string | null;
  internalParticipantId?: string | null;
  externalParticipantId?: string | null;
}
export const callState = atom<Calls>({
  key: 'callState',
  default: {
    calls: [],
    activeCall: null,
  },
});

interface Org {
  orgId: string;
  orgName: string;
  orgSelected: boolean;
  orgList: any[];
  client_id?: string | null;
}

export const orgState = atom<Org>({
  key: 'orgState',
  default: {
    orgId: "",
    orgName: "",
    orgSelected: false,
    orgList: [],
    client_id: null,
  },
});
export const alertState = atom({
  key: 'alertState',
  default: {
    message: '',
    type: 'info',
    duration: 3000,
    show:false
  },
});

export const ttecState = atom({
  key: 'ttecState',
  default: {
    ttecId: null,
    ttecName: null,
    isAuthenticated: false,
  },
});

export const startDateState = atom<Date | null>({
  key: 'startDateState',
  default: null,
});

export const endDateState = atom<Date | null>({
  key: 'endDateState',
  default: null,
});

export const progressState = atom<number>({
  key: 'progressState',
  default: 0,
});

export const isProcessingState = atom<boolean>({
  key: 'isProcessingState',
  default: false,
});

export const queueState = atom({
  key: 'queueState',
  default: {
    queues: [],
    selectedQueues: []
  },
});
export const keywordState = atom({
  key: 'keywordState',
  default: {
    keywords: [],
    search: [],
  },
});
