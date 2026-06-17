export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100%-100px)]">
      <div className="text-center max-w-2xl w-full">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6">
          v1.0 업데이트 완료
        </div>
        
        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          총겜동 내수서버<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            서버 정보 및 강화 시뮬레이터
          </span>
        </h1>
        
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-12">
          왼쪽 메뉴에서 원하는 메뉴를 선택하여<br/>서버 정보 및 강화 및 제작 시뮬레이션을 볼 수 있습니다.
        </p>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none inline-block">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            빨간약 정보를 막기 위해 스트리머분들께서는 꼭 스트리머모드를 사용해주시기 바랍니다.<br/>길드/직업 현황에는 장비, 스탯이 기록될 예정이기 때문에 스트리머분들께서는 이용을 삼가주세요.<br/>스트리머 모드는 우측 상단 버튼으로 끄고 켤 수 있습니다 💡
          </p>
        </div>
      </div>
    </div>
  );
}
