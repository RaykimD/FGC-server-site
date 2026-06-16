import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 위에서 변환한 데이터
        const REGULAR_APPLICANTS = [
            { name: "클로이", id: "vf3366" }, { name: "견자희", id: "gyeonjahee" }, { name: "깐숙", id: "nangnan" },
            { name: "김뱅글:Þ", id: "happyness192" }, { name: "김동욱", id: "ehddnr5614" }, { name: "만조", id: "tadis6997" },
            { name: "♡소유나♡", id: "kyoonah1217" }, { name: "히어로레드", id: "ttobeherored" }, { name: "키이세", id: "0e0e4e" },
            { name: "갓데드_", id: "bks04192" }, { name: "요요에요∀", id: "wooldi" }, { name: "차투리", id: "hololoolu" },
            { name: "황희봉", id: "heebong666l" }, { name: "심술:3", id: "jss1542" }, { name: "찐랑", id: "phs6162" },
            { name: "졔리", id: "0jjerry0" }, { name: "김규태", id: "gyutae1638" }, { name: "사과몽", id: "lyj9306" },
            { name: "뽀린걸", id: "bboringirl" }, { name: "광수야.", id: "ywsh12" }, { name: "울산큰고래", id: "bach023" },
            { name: "우마이:>", id: "eun0333" }, { name: "S2라봄", id: "dkfma553" }, { name: "멍보리¿", id: "bb0rii" },
            { name: "혀니일세", id: "cyeong" }, { name: "히키☆", id: "hikicomoring" }, { name: "태민98", id: "damin0714" },
            { name: "니즈__", id: "neez0611" }, { name: "희희덕", id: "poippoi52" }, { name: "묵아", id: "nororo" },
            { name: "버드_♥", id: "nam2bird" }, { name: "_채하나", id: "chae1hana" }, { name: "라율", id: "layule" },
            { name: "이지한!", id: "jihan110" }, { name: "슨미.", id: "jjgod9312" }, { name: "뵤리", id: "hwajeong0831" },
            { name: "쨈도은", id: "odoeun" }, { name: "밀크티냠", id: "ducke77" }, { name: "두부랑_", id: "dubulang0901" },
            { name: "프하", id: "peuhaha" }, { name: "히뚜*", id: "rud21458" }, { name: "딸기슈몽이♡", id: "ddalgishoux" },
            { name: "마두", id: "dhql1004" }, { name: "다쁘", id: "ekgml8766" }, { name: "야옴♥", id: "yaom0728" },
            { name: "시몽", id: "ximong" }, { name: "구본좌", id: "koo2202" }, { name: "냥쿠미", id: "kumi030a" },
            { name: "오늘님", id: "pqf1234" }, { name: "채하", id: "fbcogk" }, { name: "찌미♥", id: "zzimio3o" },
            { name: "진호.", id: "jangjh5409" }, { name: "땡지+", id: "yyk3390" }, { name: "리브레ㆍ", id: "libre1900" },
            { name: "감자가비", id: "doki0818" }, { name: "부잉이!", id: "buuuuing" },
            { name: "마리별_", id: "maribyeol" }, { name: "삐요코", id: "nlov555jij" }, { name: "철쑤_", id: "choelssu" },
            { name: "나나문", id: "nanamoon777" }, { name: "연주아", id: "sudal0923" }, { name: "심슨__", id: "dudgns1324" },
            { name: "물초코", id: "moolchoco" }, { name: "와앙이♬", id: "waanwaan" }, { name: "죠아써", id: "jjoasseo13" },
            { name: "한아밍", id: "kim91709" }, { name: "뚜닝", id: "ioocom" }, { name: "호두머니", id: "kpooher34" },
            { name: "비비-3-", id: "gamer5g5" }, { name: "너보링", id: "hibby1004" }, { name: "구월이_", id: "isq1158" },
            { name: "아눙", id: "015234" }, { name: "멜로딩딩", id: "melodingding" }, { name: "베베리", id: "hye11u" },
            { name: "피치:3", id: "nslah830" }, { name: "김세노", id: "os3n0o" }, { name: "여백º", id: "wkdghdtjr99" },
            { name: "눈길.", id: "qksdy147" }, { name: "킴아연", id: "gptn1109" }, { name: "플리ㆍ", id: "plincess" },
            { name: "연우얌z", id: "eunnnny2" }, { name: "깡담비", id: "cjstkdbsl3" }, { name: "설설설=333", id: "o31511" },
            { name: "꽁아지ぐ", id: "azi1253" }, { name: "또니´", id: "tjsgml899" }, { name: "김마렌", id: "kimmaren77" },
            { name: "감초♥", id: "33h2101" }, { name: "힙비", id: "rlawlsthfw" }, { name: "콧시_", id: "oss0930" },
            { name: "쏭이♥", id: "gatgdf" }, { name: "잼율이", id: "jamyul2" }, { name: "_해이_", id: "kjkj4424" },
            { name: "성하늘", id: "hongseol" }, { name: "백도아", id: "heeeejyu" }, { name: "최르_", id: "csc0568" },
            { name: "떵규_", id: "sunglim001" }, { name: "김부각º", id: "kgywjd2210" }, { name: "배민정", id: "minguri1016" },
            { name: "세리아-", id: "seriya0312" }, { name: "셀키_", id: "sellkey" }, { name: "시로♥", id: "qwhy1040" },
            { name: "백청미", id: "wtcheongmi" }, { name: "초아♬", id: "ehehdldl" }, { name: "코에♬", id: "yotsubakoe" },
            { name: "새마요", id: "newmayo" }, { name: "손진석.", id: "thswlstjr666" }, { name: "니니밍", id: "niniming" },
            { name: "냥냥두둥", id: "doodong" }, { name: "묭씨", id: "secymyong" }, { name: "호미밍", id: "donggeul2" },
            { name: "이학일.", id: "sh0w422" }, { name: "설빈달", id: "nsnowthemoon" }, { name: "유키", id: "amaiyk0105" },
            { name: "르미루~", id: "rmrss2" }, { name: "투냥츠_", id: "toocats" }, { name: "쏭아야", id: "asdk0110" },
            { name: "띠꾸♥", id: "ddikku0714" }, { name: "돗챠", id: "dotcha" }, { name: "채윤아", id: "yuna812" }
        ];
        const VETERAN_APPLICANTS = [{ name: "꼼모리", id: "et0726" },
        { name: "설설설=333", id: "o31511" },
        { name: "니즈__", id: "neez0611" },
        { name: "감자가비", id: "doki0818" },
        { name: "땡지+", id: "yyk3390" },
        { name: "차큐", id: "nchachaq7" },
        { name: "모치", id: "mong0519" },
        { name: "진성준짱", id: "m2stic" }
        ];

        // 중복 제거 (아이디 기준)
        const uniqueRegular = Array.from(new Map(REGULAR_APPLICANTS.map(item => [item.id, item])).values());
        const uniqueVeteran = Array.from(new Map(VETERAN_APPLICANTS.map(item => [item.id, item])).values());

        return NextResponse.json({
            success: true,
            data: {
                regular: uniqueRegular,
                veteran: uniqueVeteran
            },
            lastUpdated: Date.now()
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: '데이터 갱신 실패' }, { status: 500 });
    }
}