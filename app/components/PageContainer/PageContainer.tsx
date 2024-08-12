export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='container mx-auto mt-10 px-4'>{children}</div>;
}
