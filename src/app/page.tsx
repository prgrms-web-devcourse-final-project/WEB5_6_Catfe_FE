'use client';

import Button from '@/component/Button';
import Spinner from '@/component/Spinner';
import showToast from '@/utils/showToast';

export default function Home() {
  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center gap-7">
      <h1 className="text-2xl">Hello World</h1>
      <h2 className="text-xl">안녕하세요</h2>
      <div className="w-60 h-60 border border-gray-500 p-4 overflow-y-auto">
        <h3>Scroll Test</h3>
        <p className="">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident molestiae expedita sint
          odio cumque aliquid vero ratione facere nam! Exercitationem laudantium officiis porro
          voluptas nulla inventore dolore sapiente natus iusto.
        </p>
      </div>
      <div className="w-60 h-60 border border-gray-500 p-4 overflow-y-auto">
        <h3>Spinner Test</h3>
        <Spinner />
      </div>
      <div className="border border-gray-500 p-4 overflow-y-auto flex flex-col gap-2">
        <h1>Button Test</h1>
        <Button
          size="lg"
          borderType="solid"
          color="primary"
          onClick={() => {
            showToast('success', '성공 Success');
            showToast('warn', '경고 Warning');
            showToast('error', '에러 Error');
            showToast('info', '정보 Info');
          }}
        >
          Button
        </Button>
        <Button size="md" borderType="solid" color="primary">
          Button
        </Button>
        <Button size="sm" borderType="solid" color="primary">
          Button
        </Button>
        <Button size="lg" borderType="solid" color="primary" disabled>
          Button
        </Button>
        <Button size="md" borderType="solid" color="primary" disabled>
          Button
        </Button>
        <Button size="sm" borderType="solid" color="primary" disabled>
          Button
        </Button>
        <Button size="lg" borderType="outline" color="primary">
          Button
        </Button>
        <Button size="md" borderType="outline" color="primary">
          Button
        </Button>
        <Button size="sm" borderType="outline" color="primary">
          Button
        </Button>
        <Button size="lg" borderType="outline" color="primary" disabled>
          Button
        </Button>
        <Button size="md" borderType="outline" color="primary" disabled>
          Button
        </Button>
        <Button size="sm" borderType="outline" color="primary" disabled>
          Button
        </Button>
        <Button size="lg" borderType="solid" color="secondary">
          Button
        </Button>
        <Button size="md" borderType="solid" color="secondary">
          Button
        </Button>
        <Button size="sm" borderType="solid" color="secondary">
          Button
        </Button>
        <Button size="lg" borderType="solid" color="secondary" disabled>
          Button
        </Button>
        <Button size="md" borderType="solid" color="secondary" disabled>
          Button
        </Button>
        <Button size="sm" borderType="solid" color="secondary" disabled>
          Button
        </Button>
        <Button size="lg" borderType="outline" color="secondary">
          Button
        </Button>
        <Button size="md" borderType="outline" color="secondary">
          Button
        </Button>
        <Button size="sm" borderType="outline" color="secondary">
          Button
        </Button>
        <Button size="lg" borderType="outline" color="secondary" disabled>
          Button
        </Button>
        <Button size="md" borderType="outline" color="secondary" disabled>
          Button
        </Button>
        <Button size="sm" borderType="outline" color="secondary" disabled>
          Button
        </Button>
      </div>
    </div>
  );
}
