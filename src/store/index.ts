import { proxy } from 'valtio';

//valtio store to deal with state management

interface BlurRegion {
  x: number;
  y: number;
  z: number;
}

interface Store {
  editMode: boolean;
  blurRegions: BlurRegion[];
}

const store = proxy<Store>({
  editMode: false,
  blurRegions: [],
});

export default store;
