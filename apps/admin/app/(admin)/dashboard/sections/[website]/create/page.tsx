import SectionForm from "@/components/pages/sections/create/form/index";

export default async function CreateSectionPage(props: { params: Promise<{ website: string }> }) {
  const params = await props.params;
  const { website } = params;
  return (
    <div>
      {/* <SectionForm websiteName={website} /> */}
      <SectionForm websiteName={website} />
    </div>
  );
}
