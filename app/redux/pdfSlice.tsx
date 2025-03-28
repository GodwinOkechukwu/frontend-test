import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PdfState {
  uploadedFile: File | null;
  annotations: any[];
}

const initialState: PdfState = {
  uploadedFile: null,
  annotations: [],
};

const pdfSlice = createSlice({
  name: "pdf",
  initialState,
  reducers: {
    setUploadedFile: (state, action: PayloadAction<File>) => {
      state.uploadedFile = action.payload;
    },
    addAnnotation: (state, action: PayloadAction<any>) => {
      state.annotations.push(action.payload);
    },
  },
});

export const { setUploadedFile, addAnnotation } = pdfSlice.actions;
export default pdfSlice.reducer;
