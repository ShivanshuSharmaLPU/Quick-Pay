import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import transactionReducer from "./slices/transactionSlice";
import requestReducer from "./slices/requestSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        transaction: transactionReducer,
        request: requestReducer,
        notification: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
