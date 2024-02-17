"use server";

import path from "path";
import prisma from "./prisma";
import { nanoid } from "nanoid";
import { isAdmin, toSlug } from "./utils";
import { del, put } from "@vercel/blob";
import { createJobSchema } from "./validation";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function createJobPosting(formData: FormData) {
  const values = Object.fromEntries(formData.entries());

  const {
    title,
    type,
    companyName,
    companyLogo,
    locationType,
    location,
    applicationEmail,
    applicationUrl,
    description,
    salary,
  } = createJobSchema.parse(values);

  const slug = `${toSlug(title)}-${nanoid(10)}`;

  let companyLogoUrl: string | undefined = undefined;

  if (companyLogo) {
    const blob = await put(
      `company_logos/${slug}${path.extname(companyLogo.name)}`,
      companyLogo,
      {
        access: "public",
        addRandomSuffix: false,
      },
    );

    companyLogoUrl = blob.url;
  }

  await prisma.job.create({
    data: {
      slug,
      title: title.trim(),
      type,
      companyName: companyName.trim(),
      companyLogoUrl,
      locationType,
      location,
      applicationEmail: applicationEmail?.trim(),
      applicationUrl: applicationUrl?.trim(),
      description: description?.trim(),
      salary: parseInt(salary),
    },
  });

  redirect("/job-submitted");
}

type FormState = { error?: string } | undefined;

export async function approveJobSubmission(
  formData: FormData,
): Promise<FormState> {
  try {
    const jobId = parseInt(formData.get("jobId") as string);
    const user = await currentUser();
    if (!user || !isAdmin(user)) {
      throw new Error("Not Authorized");
    }

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        approved: true,
      },
    });

    revalidatePath("/");
  } catch (error) {
    let message = "Unexpected Error";
    if (error instanceof Error) {
      message = error.message;
    }
    return { error: message };
  }
}

export async function deleteJobSubmission(formData: FormData) {
  try {
    const jobId = parseInt(formData.get("jobId") as string);
    const user = await currentUser();
    if (!user || !isAdmin(user)) {
      throw new Error("Not Authorized");
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (job?.companyLogoUrl) {
      await del(job.companyLogoUrl);
    }

    await prisma.job.delete({
      where: {
        id: jobId,
      },
    });
  } catch (error) {
    let message = "Unexpected Error";
    if (error instanceof Error) {
      message = error.message;
    }
    return { error: message };
  }

  redirect("/admin");
}
