import prisma from "@/lib/prisma";
import JobListItem from "./JobListItem";
import { JobFilterValues } from "@/lib/validation";
import { Prisma } from "@prisma/client";

interface JobResultsProps {
  filterValues: JobFilterValues;
}

export default async function JobResults({
  filterValues: { query, type, location, remote },
}: JobResultsProps) {
  const searchString = query
    ?.split(" ")
    .filter((word) => word.length > 0)
    .join(" & ");
  const searchFilter: Prisma.JobWhereInput = searchString
    ? {
        OR: [
          { title: { search: searchString } },
          { companyName: { search: searchString } },
          { type: { search: searchString } },
          { locationType: { search: searchString } },
          { location: { search: searchString } },
        ],
      }
    : {};

  const where: Prisma.JobWhereInput = {
    AND: [
      searchFilter,
      type ? { type } : {},
      location ? { location } : {},
      remote ? { locationType: "Remote" } : {},
      { approved: true },
    ],
  };

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4 grow">
      {jobs?.map((job) => <JobListItem key={job.id} job={job} />)}
      {jobs.length === 0 && (
        <p className="text-center m-auto">
          No jobs found. Try adjusting your search filters.
        </p>
      )}
    </div>
  );
}
