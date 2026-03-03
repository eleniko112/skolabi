import { ThemeInitializer } from '@/components/board/theme-initializer';

export default async function MobileBoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  return (
    <>
      <ThemeInitializer schoolId={schoolId} />
      {children}
    </>
  );
}
