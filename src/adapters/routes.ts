import { Router } from "express";
import InvokeAdapter from "./invokeAdapter/invokeAdapter";
import UploadAdapter from "./uploadAdapter/uploadAdapter";

const router = Router();

router.post("/V1/product/analysis/invoke", async (req, res) => {
    return await InvokeAdapter.invokeAnalysisSource(req, res);
});

router.get("/V1/product/analysis/uploadUrl", async (req, res) => {
    return await UploadAdapter.uploadAnalysisSource(req, res);
});


export default router;
