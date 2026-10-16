import type { Stop } from '../../shared/types.js'

// 站點照片：皆來自 Wikimedia Commons，依授權標示作者與授權
// note：示意圖＝非該店實拍；X分店＝同品牌不同分店
export const hongkongPhotos: Record<number, Pick<Stop, 'imageUrl' | 'imageCredit'>> = {
  // 一點心
  1: {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/One_Dim_Sum%2C_Michelin-Star_Fast_Food_Dim_Sum_in_Hong_Kong_SML.20120818.IP3_%287809374102%29.jpg/960px-One_Dim_Sum%2C_Michelin-Star_Fast_Food_Dim_Sum_in_Hong_Kong_SML.20120818.IP3_%287809374102%29.jpg',
    imageCredit: {
      author: 'See-ming Lee',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:One_Dim_Sum,_Michelin-Star_Fast_Food_Dim_Sum_in_Hong_Kong_SML.20120818.IP3_(7809374102).jpg',
    },
  },
  // 蘭苑饎館
  13: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Hong_Kong-style_French_toast_%285522869044%29.jpg/960px-Hong_Kong-style_French_toast_%285522869044%29.jpg',
    imageCredit: {
      author: 'Melvin Loi from Macau, Macau',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hong_Kong-style_French_toast_(5522869044).jpg',
      note: '示意圖',
    },
  },
  // HashtagB
  4: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/A_egg_tart_and_coconut_tart_in_Cafe_2.0.jpg/960px-A_egg_tart_and_coconut_tart_in_Cafe_2.0.jpg',
    imageCredit: {
      author: 'Peachyeung316',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_egg_tart_and_coconut_tart_in_Cafe_2.0.jpg',
      note: '示意圖',
    },
  },
  // 霸王茶姬
  2: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E9%BE%8D%E5%B4%97_Longgang_%E9%BE%8D%E5%B4%97%E5%A4%A7%E9%81%93_Longgang_Avenue_%E6%98%9F%E9%83%BD%E9%87%8C%E5%95%86%E5%A0%B4_OMG_Xing_Too_Li_Shopping_Mall_shop_%E9%9C%B8%E7%8E%8B%E8%8C%B6%E5%A7%AC_Chagee_Beverage_February_2025_R12S_03.jpg/960px-thumbnail.jpg',
    imageCredit: {
      author: 'MUKSWO msrdoow',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E9%BE%8D%E5%B4%97_Longgang_%E9%BE%8D%E5%B4%97%E5%A4%A7%E9%81%93_Longgang_Avenue_%E6%98%9F%E9%83%BD%E9%87%8C%E5%95%86%E5%A0%B4_OMG_Xing_Too_Li_Shopping_Mall_shop_%E9%9C%B8%E7%8E%8B%E8%8C%B6%E5%A7%AC_Chagee_Beverage_February_2025_R12S_03.jpg',
      note: '深圳分店',
    },
  },
  // 太平山山頂纜車
  5: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/The_Peak_Tram%2C_Hong_Kong_%28Ank_Kumar%29_01.jpg/960px-The_Peak_Tram%2C_Hong_Kong_%28Ank_Kumar%29_01.jpg',
    imageCredit: {
      author: 'Ank Kumar',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Peak_Tram,_Hong_Kong_(Ank_Kumar)_01.jpg',
    },
  },
  // Bake House
  3: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Custard%2BEgg%2BTarts%2B-%2BHong%2BKong.jpg/960px-Custard%2BEgg%2BTarts%2B-%2BHong%2BKong.jpg',
    imageCredit: {
      author: 'Donatingpictures',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Custard%2BEgg%2BTarts%2B-%2BHong%2BKong.jpg',
      note: '示意圖',
    },
  },
  // 凌霄閣摩天台 428
  6: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/ThePeakTowerViewingTerrace.JPG/960px-ThePeakTowerViewingTerrace.JPG',
    imageCredit: {
      author: 'WiNG',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:ThePeakTowerViewingTerrace.JPG',
    },
  },
  // 張保仔號
  7: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Chinese_Junk%2C_Victoria_Harbour%2C_Hong_Kong_%2816455719585%29.jpg/960px-Chinese_Junk%2C_Victoria_Harbour%2C_Hong_Kong_%2816455719585%29.jpg',
    imageCredit: {
      author: 'Ray in Manila',
      license: 'CC BY 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chinese_Junk,_Victoria_Harbour,_Hong_Kong_(16455719585).jpg',
    },
  },
  // 妹記大排檔
  8: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Dai_pai_dong_Central.jpg/960px-Dai_pai_dong_Central.jpg',
    imageCredit: {
      author: 'K.C. Tang',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dai_pai_dong_Central.jpg',
      note: '示意圖',
    },
  },
  // ChaTraMue
  9: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/HK_CWB_%E9%8A%85%E9%91%BC%E7%81%A3_Causeway_Bay_%E6%B8%A3%E7%94%B8%E8%A1%97_Jardine%27s_Bazaar_shop_April_2021_SS2_08_ChaTraMue.jpg/960px-HK_CWB_%E9%8A%85%E9%91%BC%E7%81%A3_Causeway_Bay_%E6%B8%A3%E7%94%B8%E8%A1%97_Jardine%27s_Bazaar_shop_April_2021_SS2_08_ChaTraMue.jpg',
    imageCredit: {
      author: 'KWOJNG ekwiuel AWAN',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:HK_CWB_%E9%8A%85%E9%91%BC%E7%81%A3_Causeway_Bay_%E6%B8%A3%E7%94%B8%E8%A1%97_Jardine%27s_Bazaar_shop_April_2021_SS2_08_ChaTraMue.jpg',
      note: '銅鑼灣分店',
    },
  },
  // 瑞記咖啡
  10: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Hong_Kong_Milk_Tea%2C_Cha_Chaan_Teng-style_with_Black_and_White_cup.jpg/960px-Hong_Kong_Milk_Tea%2C_Cha_Chaan_Teng-style_with_Black_and_White_cup.jpg',
    imageCredit: {
      author: 'Nikoletic126',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hong_Kong_Milk_Tea,_Cha_Chaan_Teng-style_with_Black_and_White_cup.jpg',
      note: '示意圖',
    },
  },
  // 電車全景遊
  11: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/TramOramic_Tour_Tram.JPG/960px-TramOramic_Tour_Tram.JPG',
    imageCredit: {
      author: 'Ceeseven',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:TramOramic_Tour_Tram.JPG',
    },
  },
  // 丹麥餅店
  12: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/HK_CWB_106-126_Leighton_Road_%E7%A6%AE%E4%BF%A1%E5%A4%A7%E5%BB%88_Lei_Shun_Court_July-2014_shop_Danish_Bakery_name_sign.JPG/960px-HK_CWB_106-126_Leighton_Road_%E7%A6%AE%E4%BF%A1%E5%A4%A7%E5%BB%88_Lei_Shun_Court_July-2014_shop_Danish_Bakery_name_sign.JPG',
    imageCredit: {
      author: 'DWarrenwoodsle',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:HK_CWB_106-126_Leighton_Road_%E7%A6%AE%E4%BF%A1%E5%A4%A7%E5%BB%88_Lei_Shun_Court_July-2014_shop_Danish_Bakery_name_sign.JPG',
    },
  },
  // 珍妮曲奇
  15: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/HK_%E4%B8%AD%E7%92%B0_Central_%E6%B0%B8%E5%92%8C%E8%A1%97_Wing_Wo_Street_shop_%E7%8F%8D%E5%A6%AE%E6%9B%B2%E5%A5%87_Jenny_Bakery_n_visitors_long_queue_March_2026_N13P_04.jpg/960px-HK_%E4%B8%AD%E7%92%B0_Central_%E6%B0%B8%E5%92%8C%E8%A1%97_Wing_Wo_Street_shop_%E7%8F%8D%E5%A6%AE%E6%9B%B2%E5%A5%87_Jenny_Bakery_n_visitors_long_queue_March_2026_N13P_04.jpg',
    imageCredit: {
      author: 'Luksongm MWLLOPPEE',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:HK_%E4%B8%AD%E7%92%B0_Central_%E6%B0%B8%E5%92%8C%E8%A1%97_Wing_Wo_Street_shop_%E7%8F%8D%E5%A6%AE%E6%9B%B2%E5%A5%87_Jenny_Bakery_n_visitors_long_queue_March_2026_N13P_04.jpg',
      note: '中環分店',
    },
  },
  // 海底撈
  16: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Haidilao_Hot_Pot_in_OP_Mall_202005.jpg/960px-Haidilao_Hot_Pot_in_OP_Mall_202005.jpg',
    imageCredit: {
      author: 'Wpcpey',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Haidilao_Hot_Pot_in_OP_Mall_202005.jpg',
      note: '荃灣分店',
    },
  },
  // 彩虹邨
  18: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Choi_Hung_building_Adam-morse-79671-unsplash.jpg/960px-Choi_Hung_building_Adam-morse-79671-unsplash.jpg',
    imageCredit: {
      author: 'Adam Morse',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Choi_Hung_building_Adam-morse-79671-unsplash.jpg',
    },
  },
  // 嘉多娜麵包店
  17: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/HK_Food_bread_%E8%8F%A0%E8%98%BF%E5%8C%85_Pineapple_bun_Catherine_Bakery_April-2011.JPG/960px-HK_Food_bread_%E8%8F%A0%E8%98%BF%E5%8C%85_Pineapple_bun_Catherine_Bakery_April-2011.JPG',
    imageCredit: {
      author: 'Bellsalam2011',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:HK_Food_bread_%E8%8F%A0%E8%98%BF%E5%8C%85_Pineapple_bun_Catherine_Bakery_April-2011.JPG',
    },
  },
  // 旗子燒鵝
  14: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Roast_Goose_Rice_with_Plum_Sauce.jpg/960px-Roast_Goose_Rice_with_Plum_Sauce.jpg',
    imageCredit: {
      author: 'Ceeseven',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Roast_Goose_Rice_with_Plum_Sauce.jpg',
      note: '示意圖',
    },
  },
  // 紅茶冰室
  19: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Typical_breakfast_of_Cha_Chaan_Teng_with_Hong_Kong_Style_Milk_Tea.jpg/960px-Typical_breakfast_of_Cha_Chaan_Teng_with_Hong_Kong_Style_Milk_Tea.jpg',
    imageCredit: {
      author: 'Rseric',
      license: 'CC BY-SA 2.5',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Typical_breakfast_of_Cha_Chaan_Teng_with_Hong_Kong_Style_Milk_Tea.jpg',
      note: '示意圖',
    },
  },
}
