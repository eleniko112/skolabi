import { ThemeInitializer } from '@/components/board/theme-initializer';

export default function MobileBoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { schoolId: string };
}) {
  return (
    <>
      <ThemeInitializer schoolId={params.schoolId} />
      {children}
    </>
  );
}
