import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applicants: null,
    },
    reducers: {
        setAllApplicants: (state, action) => {
            state.applicants = action.payload;
        },
        updateApplicationStatus: (state, action) => {
            const { id, status } = action.payload;
            if (state.applicants && state.applicants.applications) {
                const applicationIndex = state.applicants.applications.findIndex(app => app._id === id);
                if (applicationIndex !== -1) {
                    state.applicants.applications[applicationIndex].status = status;
                }
            }
        }
    }
});
export const { setAllApplicants, updateApplicationStatus } = applicationSlice.actions;
export default applicationSlice.reducer;