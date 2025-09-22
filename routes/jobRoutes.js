import express from "express";
import {
  getGovJobs,
  getGovJobById,
  createGovJob,
  updateGovJob,
  deleteGovJob,
} from "../controllers/GovJobController.js";

const router = express.Router();

router.route("/")
  .get(getGovJobs)
  .post(createGovJob);

router.route("/:id")
  .get(getGovJobById)
  .put(updateGovJob)
  .delete(deleteGovJob);

export default router;
