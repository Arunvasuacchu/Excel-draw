import { configureStore } from '@reduxjs/toolkit';
import menuReducer from '@/slice/menu'; // Adjusted the import name
import toolboxReducer from '@/slice/toolBoxSlice'; // Adjusted the import name

export const store = configureStore({
    reducer: {
        menu: menuReducer, // Adjusted the reducer name
        toolbox: toolboxReducer // Adjusted the reducer name
    }
});
