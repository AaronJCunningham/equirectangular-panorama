import { proxy } from 'valtio';

interface BlurRegion {
  x: number;
  y: number;
  radius: number;
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
