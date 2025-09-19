import Spinner from '@/component/Spinner';

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
        <Spinner width="500px" height="200px" />
      </div>
    </div>
  );
}
