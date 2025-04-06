import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    uid: number | null;
    role: string;
    name: string;
    email: string;
    cell: string;
    img: string;
  }
  
  const initialState: UserState = {
    uid: null,
    role: '',
    name: '',
    email: '',
    cell: '',
    img: '',
  };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      // Assign the entire user object
      return action.payload;
    },
    clearUser(state) {
        // Reset the state to the initial values
        state.uid = null;
        state.role = '';
        state.name = '';
        state.email = '';
        state.cell = '';
        state.img = '';
      },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
