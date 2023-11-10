// https://usefulangle.com/post/97/nodejs-resize-image
// npm install sharp --save
// node resize


const fs = require('fs');
// const path = require("path")
const sharp = require('sharp');
// const exif = require('exif');
var image_size = require('image-size');
// var caption = require('caption');
const jimp = require('jimp') ;

// --- School's images ---

const rootFolder = 'c:/dev/charity/hoang';
const appFolder = 'c:/dev/charity';
const oFolder = appFolder +'/wordpress/page-image';

const WIDTH = 1280;

// const HEIGHT = 720;

// --- Phuong's images ---

// const WIDTH = 2084;
// const HEIGHT = 2084;
// const inFolder = 'c:/dev/charity/wordpress/phuong/home';
// const outFolder = 'c:/dev/charity/wordpress/phuong/home1';
// DIM:  c:/dev/charity/wordpress/phuong/home/9.png { height: 2084, width: 4334, type: 'png' }
// DIM:  c:/dev/charity/wordpress/phuong/home/6.png { height: 2084, width: 2084, type: 'png' }
// DIM:  c:/dev/charity/wordpress/phuong/home/11.png { height: 8840, width: 8839, type: 'png' }
// DIM:  c:/dev/charity/wordpress/phuong/home/8.png { height: 1828, width: 1975, type: 'png' }
// const images = [
// 	"9.png","",
// 	"11.png","",
// 	"6.png","",
// 	"8.png", "",
// ]

const folders = [
	['school-3/KhanhVinh2', 'KhanhVinh2', '31/05/2023 - TH TT Khánh Vĩnh, huyện Khánh Vĩnh - 210 HS'],
]

const files = {
	"KhanhVinh2": [
		"/images/20230531_074744.jpg", "",
		"/images/20230531_081123.jpg", "",
		"/images/20230531_081152.jpg", "",
		"/images/20230531_081130.jpg", "",
		"/images/20230531_081811.jpg", "",
		"/images/20230531_084910.jpg", "",
		"/images/20230531_084914.jpg", "",
		"/images/20230531_081846.jpg", "",
		"/images/20230531_081940.jpg", "",
		"/images/20230531_075020.jpg", "",
		"/images/20230531_092504.jpg", "",
		"/images/viber_image_2023-06-01_08-57-55-427.jpg", "",
	],
}

const folders1 = [
	['school-3/KhanhVinh2', 'KhanhVinh2', '31/05/2023 - TH TT Khánh Vĩnh, huyện Khánh Vĩnh - 210 HS'],
	['school-3/JeJu', 'JeJu', '11/05/2023 - TH Khánh Hòa - JeJu, huyện Cam Lâm - 280 HS'],
	['school-3/VanhKhuyen', 'VanhKhuyen', '27/04/2023 - MG Vành Khuyên, huyện Cam Lâm - 116 HS'],
	['school-3/KhanhVinh', 'KhanhVinh', '24/04/2023 - TH TT Khánh Vĩnh, huyện Khánh Vĩnh - 105 HS'],
	['school-2/KhanhPhu1', 'KhanhPhu1', '28/11/2022 - TH Khánh Phú 1, huyện Khánh Vĩnh - 155 HS'],
	['school-2/CamThinhTay', 'CamThinhTay', '19/11/2022 - THCS Cam Thịnh Tây, Thị xã Cam Ranh - 228 HS'],
	['school-2/KhanhThuong', 'KhanhThuong', '11/10/2022 - TH Khánh Thượng, huyện Khánh Vĩnh - 321 HS'],
	['school-2/SonThai', 'SonThai', '27/05/2022 - TH Sơn Thái, huyện Khánh Vĩnh - 105 HS'],
	['school-1/CamHoa', 'CamHoa', '19/03/2022 - TH Cam Hòa 1, huyện Cam Lâm - 105 HS'],
	['school-1/LienSang', 'LienSang', '17/03/2022 - TH Liên Sang, huyện Khánh Vĩnh - 105 HS'],
	['school-1/NinhSon', 'NinhSon', '19/01/2022 - TH Ninh Sơn, huyện Ninh Hòa - 105 HS'],
	['school-1/DienBinh', 'DienBinh', '14/01/2022 - TH Diên Bình, huyện Diên Khánh - 105 HS'],
	['school-1/DienTan', 'DienTan', '31/12/2021 - TH Diên Tân, huyện Diên Khánh - 105 HS'],
	['school-1/DaiLanh', 'DaiLanh', '12/12/2021 - TH Đại Lãnh, huyện Vạn Ninh - 210 HS'],
	['school-1/DienXuan', 'DienXuan', '26/05/2021 - TH Diên Xuân, huyện Diên Khánh - 105 HS'],
	['school-1/NinhPhu', 'NinhPhu', '31/01/2021 - TH Ninh Phú, huyện Ninh Hòa - 105 HS'],
	['school-1/NinhTay', 'NinhTay', '31/01/2021 - TH Ninh Tây, huyện Ninh Hòa - 105 HS'],
	// ['school-1/XuanSon', 'XuanSon', '14/09/2020 - TH Xuân Sơn, huyện Ninh Hòa - 105 HS'],
]

// const folders = [
// 	['school-3/KhanhVinh', 'KhanhVinh', '24/04/2023 - TH TT Khánh Vĩnh, huyện Khánh Vĩnh - 105 HS'],
// 	['school-3/VanhKhuyen', 'VanhKhuyen', '27/04/2023 - MG Vành Khuyên, huyện Cam Lâm - 116 HS'],
// 	['school-3/JeJu', 'JeJu', '11/05/2023 - TH Khánh Hòa - JeJu, huyện Cam Lâm - 280 HS'],
// 	['school-1/CamHoa', 'CamHoa', '19/03/2022 - TH Cam Hòa 1, huyện Cam Lâm - 105 HS'],
// 	['school-1/DaiLanh', 'DaiLanh', '12/12/2021 - TH Đại Lãnh, huyện Vạn Ninh - 210 HS'],
// 	['school-1/DienBinh', 'DienBinh', '14/01/2022 - TH Diên Bình, huyện Diên Khánh - 105 HS'],
// ]

const files1 = {
	"JeJu": [
		// "/images/20230511_081031.jpg", "",
		// "/images/20230511_081320.jpg", "",
		// "/images/20230511_081430.jpg", "",
		// "/images/20230511_081548.jpg", "",
		// "/images/20230511_081552.jpg", "",
		// "/images/20230511_083145.jpg", "",
		// "/images/20230511_084516.jpg", "",
		// "/images/20230511_085120.jpg", "",
		// "/images/20230511_085541.jpg", "",
		"/images/20230511_081031.jpg", "",
		"/images/20230511_085024.jpg", "",
		"/images/20230511_085120.jpg", "",
		"/images/20230511_081711.jpg", "",
		"/images/20230511_082035.jpg", "",
		"/images/20230511_081548.jpg", "",
		"/images/20230511_082517.jpg", "",
		"/images/20230511_082959.jpg", "",
		"/images/20230511_083455.jpg", "",
		"/images/20230511_083652.jpg", "",
		"/images/20230511_085541.jpg", "",
	],
	"VanhKhuyen": [
		// "/images/20230427_092107.jpg", "",
		// "/images/20230427_092803.jpg", "",
		// "/images/20230427_093341.jpg", "",
		// "/images/20230427_094421.jpg", "",
		// "/images/20230427_094647.jpg", "",
		// "/images/viber_image_2023-04-28_08-53-59-228.jpg", "",
		// "/images/viber_image_2023-04-28_08-54-00-175.jpg", "",
		// "/images/viber_image_2023-04-28_08-54-00-537.jpg", "",
		// "/images/viber_image_2023-04-28_08-54-00-901.jpg", "",
		"/images/20230427_090338.jpg", "",
		"/images/20230427_092803.jpg", "",
		"/images/20230427_093131.jpg", "",
		"/images/20230427_093341.jpg", "",
		"/images/20230427_094013.jpg", "",
		"/images/20230427_094426.jpg", "",
		"/images/20230427_094647.jpg", "",
	],
	"KhanhVinh": [
		// "/images/20230424_085140.jpg", "",
		// "/images/20230424_090522.jpg", "",
		// "/images/20230424_091324.jpg", "",
		// "/images/20230424_092200.jpg", "",
		// "/images/20230424_092637.jpg", "",
		// "/images/20230424_092653.jpg", "",
		// "/images/20230424_092748.jpg", "",
		// "/images/20230424_093126.jpg", "",
		// "/images/20230424_094038.jpg", "",

		"/images/20230424_085140.jpg", "",
		"/images/20230424_091324.jpg", "",
		"/images/20230424_092200.jpg", "",
		"/images/20230424_092637.jpg", "",
		"/images/20230424_093126.jpg", "",
		"/images/20230424_093644.jpg", "",
		"/images/20230424_094038.jpg", "",
		"/images/20230424_092653.jpg", "",
	],
	"KhanhPhu1": [
		"/images/viber_image_2022-11-30_18-26-02-019.jpg", "",
		"/images/viber_image_2022-11-30_18-26-02-662.jpg", "",
		"/images/20111128_094815.jpg", "",
		"/images/020-viber_image_2022-11-30_18-24-49-559.jpg", "",
		"/images/015-viber_image_2022-11-30_18-24-49-930.jpg", "",
		"/images/viber_image_2022-11-30_18-24-50-304.jpg", "",
		"/images/viber_image_2022-11-30_18-24-51-104.jpg", "",
		"/images/viber_image_2022-11-30_18-24-51-491.jpg", "",
		"/images/030-viber_image_2022-11-30_18-24-52-273.jpg", "",
		"/images/viber_image_2022-11-30_18-26-01-636.jpg", "",
		"/images/viber_image_2022-11-30_18-24-52-645.jpg", "",
		"/images/viber_image_2022-11-30_18-24-51-882.jpg", "",
		"/images/viber_image_2022-11-30_18-24-48-179.jpg", "",
	],
	"CamThinhTay": [
		"/images/20221119_093736.jpg", "",
		"/images/viber_image_2022-11-21_10-32-08-840-app.jpg", "",
		"/images/viber_image_2022-11-21_10-31-30-804-app.jpg", "",
		"/images/viber_image_2022-11-21_10-31-43-185.jpg", "",
		"/images/viber_image_2022-11-21_10-31-53-359-app.jpg", "",
		"/images/viber_image_2022-11-21_10-32-01-182.jpg", "",
		"/images/viber_image_2022-11-24_06-28-06-332.jpg", "",
		"/images/viber_image_2022-11-24_06-28-06-946.jpg", "",
		"/images/viber_image_2022-11-24_06-28-07-613.jpg", "",
		"/images/viber_image_2022-11-24_06-28-09-089.jpg", "",
		"/images/viber_image_2022-11-21_10-32-16-815-app.jpg", "",
		"/images/20221119_100905-app.jpg", "",
		"/images/viber_image_2022-11-24_06-28-07-274.jpg", "",
		"/images/viber_image_2022-11-24_06-28-06-630.jpg", "",
	],
	"KhanhThuong": [
		"/images/20221011_093055.jpg", "",
		"/images/20221011_092634.jpg", "",
		"/images/20221011_090407.jpg", "",
		"/images/20221011_085430.jpg", "",
		"/images/20221011_084823.jpg", "",
		"/images/20221011_100021.jpg", "",
		"/images/20221011_100640.jpg", "",
		"/images/20221011_100918.jpg", "",
		"/images/20221011_101357.jpg", "",
		"/images/20221011_095902.jpg", "",
		"/images/20221011_100237.jpg", "",
		"/images/20221011_100144.jpg", "",
		"/images/20221011_093310.jpg", "",
		"/images/20221011_084806.jpg", "",
	],
"SonThai": [
		"/images/20220518_105051.jpg", "",
		"/images/20220527_091028.jpg", "",
		"/images/20220527_091846.jpg", "",
		"/images/20220527_092320.jpg", "",
		"/images/20220527_092028.jpg", "",
		"/images/20220527_091225.jpg", "",
		"/images/20220527_092441.jpg", "",
		"/images/20220518_104912.jpg", "",
		"/images/20220518_104850.jpg", "",
	],
	"CamHoa": [
		"/images/20220319_091914.jpg", "",
		"/images/20220319_094117.jpg", "",
		"/images/20220319_094356-app.jpg", "",
		"/images/20220319_095258-app.jpg", "",
		"/images/20220319_095559.jpg", "",
		"/images/20220319_095602-app.jpg", "",
		"/images/20220319_095854-app.jpg", "",
	],
	"LienSang": [
		"/images/20220317_093948.jpg", "",
		"/images/20220317_093716.jpg", "",
		"/images/20220317_093439.jpg", "",
		"/images/20220317_093415.jpg", "",
		"/images/20220317_093314-app.jpg", "",
		"/images/20220317_093125-app.jpg", "",
		"/images/20220317_092505.jpg", "",
		"/images/20220317_092304-app.jpg", "",
		"/images/20220317_091550.jpg", "",
		"/images/20220317_090926.jpg", "",
		"/images/20220317_090300.jpg", "",
	],
	"NinhSon": [
		"/images/20220119_094455.jpg", "",
		"/images/20220119_094250-app.jpg", "",
		"/images/20220119_094039.jpg", "",
		"/images/20220119_093532.jpg", "",
		"/images/20220119_093415.jpg", "",
		"/images/20220119_092709.jpg", "",
		"/images/20220119_092332.jpg", "",
		"/images/20220119_091959-app.jpg", "",
		"/images/20220119_091906-app.jpg", "",
	],
	"DienBinh": [
		"/images/20220114_083815-app.jpg", "",
		"/images/20220114_084130.jpg", "",
		"/images/20220114_084409-app.jpg", "",
		"/images/20220114_084909.jpg", "",
		"/images/20220114_084943.jpg", "",
		"/images/20220114_085115.jpg", "",
		"/images/20220114_085234-app.jpg", "",
		"/images/20220114_085259.jpg", "",
		"/images/20220114_085310.jpg", "",
		"/images/20220114_085519-app.jpg", "",
		"/images/20220114_085921.jpg", "",
	],
	"DienTan": [
		"/images/20211231_095926.jpg", "",
		"/images/20211231_095947.jpg", "",
		"/images/20211231_100250.jpg", "",
		"/images/20211231_100440.jpg", "",
		"/images/20211231_100858.jpg", "",
		"/images/20211231_101016.jpg", "",
		"/images/20211231_101247.jpg", "",
		"/images/20211231_101533.jpg", "",
		"/images/20211231_101724.jpg", "",
		"/images/20211231_101710_01-app.jpg", "",
		"/images/20211231_101736.jpg", "",
		"/images/20211231_101757-app.jpg", "",
		"/images/20211231_101836-app.jpg", "",
		"/images/20211231_102135-app.jpg", "",
	],
	"DaiLanh": [
		"/images/viber_image_2021-12-24_09-23-03-164-app.jpg", "",
		"/images/viber_image_2021-12-24_09-23-02-429-app.jpg", "",
		"/images/viber_image_2021-12-24_09-23-02-007.jpg", "",
		"/images/viber_image_2021-12-24_09-23-01-557.jpg", "",
		"/images/viber_image_2021-12-24_09-23-01-049-app.jpg", "",
		"/images/viber_image_2021-12-24_09-23-00-698.jpg", "",
		"/images/viber_image_2021-12-24_09-22-59-922-app.jpg", "",
		"/images/20210622_055519-app.jpg", "",
	],
	"DienXuan": [
		"/images/20210526_0754271-app.jpg", "",
		"/images/20210526_0733091-app.jpg", "",
	],
	"NinhPhu": [
		"/images/viber_image_2022-03-28_14-34-05-863-app.jpg", "",
		"/images/viber_image_2022-03-28_14-34-00-688-app.jpg", "",
		"/images/viber_image_2022-03-28_14-34-16-971-app.jpg", "",
		"/images/viber_image_2022-03-28_14-34-09-851-app.jpg", "",
		"/images/viber_image_2022-03-28_14-34-20-403.jpg", "",
		"/images/viber_image_2022-03-28_14-34-24-702-app.jpg", "",
	],
	"NinhTay": [
		"/images/Hinh-1-app.jpg", "",
		"/images/Hinh-4-app.jpg", "",
		"/images/Hinh-3-app.jpg", "",
		"/images/Hinh-2-app.jpg", "",
		"/images/20210131_102641.jpg", "",
		"/images/20210131_081553.jpg", "",
		"/images/20210131_081207.jpg", "",
		"/images/20210131_081146.jpg", "",
		"/images/20210131_075959.jpg", "",
		"/images/20210131_075939.jpg", "",
		"/images/20210131_075926.jpg", "",
		"/images/20210131_075916.jpg", "",
	],
};





const folders_12 = [
	['school-2/KhanhPhu1/images', 'KhanhPhu1', '28/11/2022 - TH Khánh Phú 1, huyện Khánh Vĩnh - 155 HS'],
	['school-2/CamThinhTay/images', 'CamThinhTay', '19/11/2022 - THCS Cam Thịnh Tây, Thị xã Cam Ranh - 228 HS'],
	['school-2/KhanhThuong/images', 'KhanhThuong', '11/10/2022 - TH Khánh Thượng, huyện Khánh Vĩnh - 321 HS'],
	['school-2/SonThai/images', 'SonThai', '27/05/2022 - TH Sơn Thái, huyện Khánh Vĩnh - 105 HS'],
	['school-1/CamHoa/images', 'CamHoa', '19/03/2022 - TH Cam Hòa 1, huyện Cam Lâm - 105 HS'],
	['school-1/LienSang/images', 'LienSang', '17/03/2022 - TH Liên Sang, huyện Khánh Vĩnh - 105 HS'],
	['school-1/NinhSon/images', 'NinhSon', '19/01/2022 - TH Ninh Sơn, huyện Ninh Hòa - 105 HS'],
	['school-1/DienBinh/images', 'DienBinh', '14/01/2022 - TH Diên Bình, huyện Diên Khánh - 105 HS'],
	['school-1/DienTan/images', 'DienTan', '31/12/2021 - TH Diên Tân, huyện Diên Khánh - 105 HS'],
	['school-1/DaiLanh/images', 'DaiLanh', '12/12/2021 - TH Đại Lãnh, huyện Vạn Ninh - 210 HS'],
	['school-1/DienXuan/images', 'DienXuan', '26/05/2021 - TH Diên Xuân, huyện Diên Khánh - 105 HS'],
	['school-1/NinhPhu/images', 'NinhPhu', '31/01/2021 - TH Ninh Phú, huyện Ninh Hòa - 105 HS'],
	['school-1/NinhTay/images', 'NinhTay', '31/01/2021 - TH Ninh Tây, huyện Ninh Hòa - 105 HS'],
	['school-1/XuanSon/images', 'XuanSon', '14/09/2020 - TH Xuân Sơn, huyện Ninh Hòa - 105 HS'],
]

const files_12 = {
	"KhanhPhu1": [
		"/archive/viber_image_2022-11-30_18-26-02-019.jpg", "Trường cách KDL Yangbay 2km",
		"/archive/viber_image_2022-11-30_18-26-02-662.jpg", "",
		"/archive/viber_image_2022-11-30_18-24-48-179.jpg", "XĐ và quà cho HS",
		"/archive/viber_image_2022-11-30_18-24-49-930.jpg", "",
		"/archive/viber_image_2022-11-30_18-24-48-179.jpg", "",
		"/archive/viber_image_2022-11-30_18-24-49-559.jpg", "",
		"/archive/viber_image_2022-11-30_18-24-51-882.jpg", "",
		"/archive/viber_image_2022-11-30_18-24-50-674.jpg", "",
		"/archive/viber_image_2022-11-30_18-24-52-273.jpg", "",
		"/archive/viber_image_2022-11-30_18-26-01-636.jpg", "",
	],
	"CamThinhTay": [
		"/archive/20221119_093736.jpg", "",
		"/archive/phuong/viber_image_2022-11-24_06-28-06-946.jpg", "",
		"/archive/phuong/viber_image_2022-11-24_06-28-07-274.jpg", "",
		"/archive/viber_image_2022-11-21_10-32-16-815-app.jpg", "",
		"/archive/viber_image_2022-11-21_10-31-30-804.jpg", "",
		"/archive/viber_image_2022-11-21_10-31-53-359-app.jpg", "",
		"/archive/viber_image_2022-11-21_10-32-08-840-app.jpg", "",
	],
	"KhanhThuong": [
		"/archive/20221011_083808.jpg", "",
		"/archive/20221011_085421-app.jpg", "",
		"/archive/20221011_092634.jpg", "",
		"/archive/20221011_093310.jpg", "",
		"/archive/20221011_100021-app.jpg", "",
		"/archive/20221011_100236.jpg", "",
		"/archive/20221011_084806.jpg", "",
	],
	"SonThai": [
		"/archive/20220518_105051.jpg", "",
		"/archive/20220518_105056.jpg", "",
		"/archive/20220527_085326.jpg", "",
		"/archive/20220527_090808.jpg", "",
		"/archive/20220527_092320.jpg", "",
		"/archive/20220527_092444.jpg", "",
	],
	"CamHoa": [
		"/archive/20220319_091914.jpg", "",
		"/archive/20220319_093640.jpg", "",
		"/archive/20220319_094117.jpg", "",
		"/archive/20220319_095559.jpg", "",
		"/archive/20220319_095848.jpg", "",
	],
	"LienSang": [
		"/archive/20220317_090300.jpg", "",
		"/archive/20220317_090926.jpg", "",
		"/archive/20220317_092809.jpg", "",
		"/archive/20220317_093314-app.jpg", "",
		"/archive/20220317_093415.jpg", "",
		"/archive/20220317_093439.jpg", "",
		"/archive/20220317_093716.jpg", "",
		"/archive/20220317_093948.jpg", "",
	],
	"NinhSon": [
		"/archive/20220119_092709.jpg", "",
		"/archive/20220119_094509.jpg", "",
		"/archive/20220119_094039.jpg", "",
		"/archive/20220119_094455.jpg", "",
		"/archive/20220119_091906-app.jpg", "",
		"/archive/20220119_092332.jpg", "",
	],
	"DienBinh": [
		"/archive/20220114_085749.jpg", "",
		"/archive/20220114_084943.jpg", "",
		"/archive/20220114_083815-app.jpg", "",
		"/archive/20220114_084409-app.jpg", "",
		"/archive/20220114_084909.jpg", "",
		"/archive/20220114_085115.jpg", "",
		"/archive/20220114_085310.jpg", "",
		"/archive/20220114_085519-app.jpg", "",
	],
	"DienTan": [
		"/archive/20211231_095926.jpg", "",
		"/archive/20211231_101757-app.jpg", "",
		"/archive/20211231_102135-app.jpg", "",
		"/archive/20211231_101836-app.jpg", "",
		"/archive/20211231_094912.jpg", "",
		"/archive/20211231_100440.jpg", "",
		"/archive/20211231_101724.jpg", "",
	],
	"DaiLanh": [
		"/archive/20210622_055519-app.jpg", "",
		"/archive/viber_image_2021-12-24_09-23-00-698.jpg", "",
		"/archive/viber_image_2021-12-24_09-23-01-049-app.jpg", "",
		"/archive/viber_image_2021-12-24_09-23-01-557.jpg", "",
		"/archive/viber_image_2021-12-24_09-23-02-007.jpg", "",
		"/archive/viber_image_2021-12-24_09-23-02-429-app.jpg", "",
		"/archive/viber_image_2021-12-24_09-23-03-164-app.jpg", "",
	],
	"DienXuan": [
		"/archive/20210526_075427-app.jpg", "",
		"/archive/20210526_0754271-app.jpg", "",
		"/archive/20210526_0733091-app.jpg", "",
	],
	"NinhPhu": [
		"/archive/viber_image_2022-03-28_14-34-00-688-app.jpg", "",
		"/archive/viber_image_2022-03-28_14-34-05-863-app.jpg", "",
		"/archive/viber_image_2022-03-28_14-34-09-851-app.jpg", "",
		"/archive/viber_image_2022-03-28_14-34-16-971-app.jpg", "",
		"/archive/viber_image_2022-03-28_14-34-20-403.jpg", "",
		"/archive/viber_image_2022-03-28_14-34-24-702-app.jpg", "",
	],
	"NinhTay": [
		"/archive/Hinh-1-app.jpg", "",
		"/archive/Hinh-3-app.jpg", "",
		"/archive/Hinh-4-app.jpg", "",
		"/archive/20210131_075939.jpg", "",
		"/archive/20210131_081146.jpg", "",
		"/archive/20210131_081207.jpg", "",
		"/archive/20210131_081553.jpg", "",
		"/archive/20210131_102641.jpg", "",
	],
	"XuanSon": [
		"/archive/0-02-06-app.jpg", "",
		"/archive/0-02-06-81b815d5dd1104a812942830c2b4a2122064e2c2308778e6717477038b4e4088_483997b9.jpg", "",
		"/archive/0-02-06-652c6ec4bf5d6de40c26d8ad94ed3eab5dd1add372cb8a99a94b0020e1931757_4ea9e056.jpg", "",
		"/archive/0-02-06-0672c59ace4e8c42ae347660447.jpg", "",
		"/archive/0-02-06-587913805d737164e4d19f4415722b55450c6718a23f989ddad286a583ed5ea0_418f906e.jpg", "",
		"/archive/0-02-06-b208e322613daeba1e8bb1c75809ab945de2c2884f7150d7951cd891e48414fd_2c8a9091.jpg", "",
		"/archive/0-02-06-eb2edd5-app.jpg", "",
		"/archive/0-02-06-f5e3826197820827a0d24c5ec2a17040457db1275bec62c5e58d7b35948d02a1_ce7ad3de.jpg", "",
		"/archive/0-02-06-f6a73c4496ab49aa6833c096549be3c41d7616f5e339c73887bb6a1ec853778d_fd171722.jpg", "",
		"/archive/viber_image_2020-09-13_19-28-48.jpg", "",
		"/archive/0-02-06-0e602ac7d2895ea22fb77843a514.jpg", "",
		"/archive/0-02-06-5ecf1ed4ed54c4eb6f9257f95-app.jpg", "",
	],
}

if (require.main === module) {

	// buildFileList();

	let srcFilesToCopy = processSchool();
	// setTimeout(() => {}, 5000);
	// let srcFilesToCopy = processImage();
	// console.log('SRC TO COPY: ', srcFilesToCopy);
	setTimeout(() => {}, 5000);
	// process files
	processFiles(srcFilesToCopy);
}

function processImage() {

	if (!fs.existsSync(outFolder)) {
		// create folder
		fs.mkdir(outFolder, (err) => {
			if (err)
					return console.error(err);
			console.log('Directory created successfully!');
		});
	}

	let srcFilesToCopy = [];
	let count = 1;

	for (let i = 0; i < images.length; i+=2) {
		let image = images[i];
		// let ext = image.substring(image.indexOf('.'));
		let caption = images[i+1];
		let inFile = inFolder + '/' + image;
		let str = (count < 10) ? '00' + count : ((count < 100) ? '0' + count : ''+count);
		let outFile = outFolder + '/' + str + '-' + image;
		srcFilesToCopy.push([inFile, outFile, caption]);

		// image_size(inFile, (err, dim) => {
		// 	let width = (dim.width < dim.height) ? dim.height : dim.width;
		// 	// srcFilesToCopy.push([inFile, outFile, caption, dim]);
		// 	console.log('DIM: ', inFile, dim);
		// });

		count++;
	}
	return srcFilesToCopy;

}

function processSchool() {

	let srcFilesToCopy = [];
	// let desFilesToDelete = [];

	for (let i = 0; i < folders.length; i++) {
		let school = folders[i][1];
		let inFolder = rootFolder + '/' + folders[i][0];
		let outFolder = oFolder + '/' + school;

		// console.log('i, inFolder, outFolder: ', (i+1), inFolder, outFolder);

		if (!fs.existsSync(outFolder)) {
			// create folder
			fs.mkdir(outFolder, (err) => {
				if (err)
						return console.error(err);
				console.log('Directory created successfully!');
			});
		}
		let count = 1;
		let data = files[school];
		if (data) {
			for (let i = 0; i < data.length; i += 2) {
				let file = data[i];
				let caption = data[i+1];
				let inFile = inFolder + file;
				let str = (count < 10) ? '00' + count : ((count < 100) ? '0' + count : ''+count);
				let outFile = outFolder + '/' + school + '-' + str + '.jpg';
				srcFilesToCopy.push([inFile, outFile, caption]);

				// add caption
				// if (caption.length > 0) {
				// 	console.log('outFile: ', outFile);

				// 	caption.path(outFile, {
				// 		caption : caption,
				// 		// bottomCaption : "This is my bowl.",
				// 		outputFile : outFile
				// 	},function(err,filename){
				// 		console.log('ERROR: ',  err);
				// 	})
				// }
				count++;
			}
			// files[school].forEach(file => {
				
			// })
		}
	}
		// fs.readdirSync(inFolder).forEach(file => {
		// 	if (file.lastIndexOf('.jpg') > 0) {
		// 		// file = path.join(__dirname, inFolder, "/", file);
		// 		let inFile = inFolder + '/' + file;
		// 		// let outFile = outFolder + '/' + outFolder + '-' + file;
		// 		let outFile = outFolder + '/' + folders[i][1] + '-' + file;
		// 		// if (start) {
		// 			// showImage(inFile)
		// 		// 	start = false;
		// 		// }
		// 		if (!fs.existsSync(outFile)) {
		// 			// console.log('src, des: ', file);
		// 			srcFilesToCopy.push([inFile, outFile]);
		// 		} else {
		// 			// console.log('src ONLY: ', file);
		// 		}
		// 	}
		// });
	// }
	return srcFilesToCopy;
}

function buildFileList() {

	const fileOut = 'c:/dev/charity/nodejs/file-list.txt';

	// ['school-3/KhanhVinh/images', 'KhanhVinh', '24/04/2023 - TH TT Khánh Vĩnh, huyện Khánh Vĩnh - 105 HS'],
// "KhanhVinh": [
	// 	"/archive/viber_image_2022-11-30_18-26-02-019.jpg", "",
	// ],

	let msg = ' ';
	for (let i = 0; i < folders.length; i++) {
		let school = folders[i][1];
		let inFolder = rootFolder + '/' + folders[i][0];
		// console.log('i, inFolder: ', (i+1), inFolder);
		// msg += inFolder + '\n';
		msg += '"' + school + '": [' + '\n';
		fs.readdirSync(inFolder).forEach(file => {
			if (file.lastIndexOf('.jpg') > 0) {
				// file = path.join(__dirname, inFolder, "/", file);
				msg += '   "/images/' + file + '", "",' + '\n';
			}
		});
		msg += '],' + '\n';
	}
	saveFile(fileOut, msg);

}

function saveFile(filePath, text) {
	fs.writeFile(filePath, text, function(err) {
			if(err)
					console.log('ERROR - ', err);
			console.log('"The file : ' + filePath + ' was saved!');
	}); 
}
// width: 1276, height: 956
// WIDTH: 1280 h = height * WIDTH / width

function processFiles(srcFilesToCopy) {

	// create src files
	srcFilesToCopy.forEach(files => {
		let inFile = files[0];
		image_size(inFile, function (err, dim) {
			// let width = (dim.width < dim.height) ? dim.height : dim.width;
			// let width = WIDTH;
			// let height = HEIGHT;
			let width = dim.width;
			let height = dim.height * WIDTH / dim.width;

			let outFile = files[1];
			sharp(inFile).resize({
				width: WIDTH, 
				height: parseInt(height),
				// fit: 'contain',
				//  width: width, 
				//  height: height,
				//  fit: 'contain',
				 background: { r: 255, g: 255, b: 255, alpha: 0.5 }
			}).toFile(outFile).then(fileInfo => {
				// let caption = files[2];
				// if (caption.length > 0) {
				// 	textOverlay(outFile, caption);
				// 	// console.log("outFile is processed succesfully");
				// }
			})
			.catch(function(err) {
				console.log("Error: ", err);
			});
		});
	})
}

// https://www.tutorialspoint.com/how-to-overlay-text-on-an-image-using-jimp-in-nodejs
// https://www.npmjs.com/package/jimp

async function textOverlay(file, caption) {
	// Reading image
	const image = await jimp.read(file);
	// Defining the text font
	// const X = 20;
	// const X = 30;
	const Y = 30;
	const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);

	 // width of text
	 let xCaption = jimp.measureText(await jimp.loadFont(jimp.FONT_SANS_32_WHITE), caption);
	// height of text
	let yCaption = jimp.measureTextHeight( await jimp.loadFont(jimp.FONT_SANS_32_WHITE), caption, 100 ); 

	// const X = 20;
	let width = image.bitmap.width;
	let height = image.bitmap.height;
	let text = 
	{
		text: caption,
		alignmentX: jimp.HORIZONTAL_ALIGN_LEFT,
		alignmentY: jimp.VERTICAL_ALIGN_TOP,
	};
	image.print(font, width / 2 - xCaption / 2, height - Y - yCaption, text);
	// Writing image after processing
	await image.writeAsync(file);
}


