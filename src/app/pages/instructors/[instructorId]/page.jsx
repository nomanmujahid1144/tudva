import Footer from "@/components/Footer";
import InstructorDetails from "./components/InstructorDetails";
import TopNavigationBar from "./components/TopNavigationBar";
import { getInstructorById } from "@/helpers/data";
import { notFound } from "next/navigation";
export const generateMetadata = async ({
  params
}) => {
  const event = await getInstructorById(params.instructorId);
  return {
    title: event?.id ?? 'Event Details'
  };
};
const InstructorDetail = async ({
  params
}) => {
  const event = await getInstructorById(params.instructorId);
  if (!event) notFound();
  return <>
      <TopNavigationBar />
      <main>
        <InstructorDetails />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default InstructorDetail;
