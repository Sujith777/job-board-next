import Select from "./ui/select";
import prisma from "@/lib/prisma";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { jobTypes } from "@/lib/job-types";
import { redirect } from "next/navigation";
import { JobFilterValues, jobFilterSchema } from "@/lib/validation";
import FormSubmitButton from "./FormSubmitButton";

async function filterJobs(formData: FormData) {
  "use server";

  const values = Object.fromEntries(formData.entries());
  const { query, type, location, remote } = jobFilterSchema.parse(values);
  const searchParams = new URLSearchParams({
    ...(query && { query: query.trim() }),
    ...(type && { type }),
    ...(location && { location }),
    ...(remote && { remote: "true" }),
  });

  redirect(`/?${searchParams.toString()}`);
}

interface JobFilterSidebarProps {
  defaultValues: JobFilterValues;
}

export default async function JobFilterSidebar({
  defaultValues,
}: JobFilterSidebarProps) {
  const distinctLocations = (await prisma.job
    .findMany({
      where: {
        approved: true,
      },
      select: {
        location: true,
      },
      distinct: ["location"],
      orderBy: { createdAt: "desc" },
    })
    .then((locations) =>
      locations.map(({ location }) => location).filter(Boolean),
    )) as string[];

  return (
    <aside className="md:w-[260px] p-4 sticky top-0 bg-background border rounded-lg h-fit">
      <form action={filterJobs} key={JSON.stringify(defaultValues)}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="query">Search</Label>
            <Input
              name="query"
              id="query"
              defaultValue={defaultValues.query}
              placeholder="Title, Company, etc ..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type" defaultValue={defaultValues.type}>
              <option value="">Job Type</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Select
              id="location"
              name="location"
              defaultValue={defaultValues.location}
            >
              <option value="">All locations</option>
              {distinctLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="remote"
              name="remote"
              type="checkbox"
              defaultChecked={defaultValues.remote}
              className="scale-125 accent-black"
            />
            <Label htmlFor="remote">Remote Jobs</Label>
          </div>
          <FormSubmitButton className="w-full">Filter Jobs</FormSubmitButton>
        </div>
      </form>
    </aside>
  );
}
