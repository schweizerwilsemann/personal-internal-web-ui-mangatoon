import { Suspense } from "react";
import ReaderClient from "@/components/ReaderClient";

export default function ReaderPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Đang tải chương nha 😘...</div>}>
      <ReaderClient />
    </Suspense>
  );
}
