/* ==========================================================================
   Integriox — Reference lists (countries / nationalities)
   Each entry: { ar: 'اسم الدولة', en: 'Country name', natAr: 'الجنسية', natEn: 'Nationality' }
   ========================================================================== */
const LISTS = (function(){

  const COUNTRIES = [
    { ar:'السعودية', en:'Saudi Arabia', natAr:'سعودي', natEn:'Saudi' },
    { ar:'الإمارات', en:'United Arab Emirates', natAr:'إماراتي', natEn:'Emirati' },
    { ar:'الكويت', en:'Kuwait', natAr:'كويتي', natEn:'Kuwaiti' },
    { ar:'قطر', en:'Qatar', natAr:'قطري', natEn:'Qatari' },
    { ar:'البحرين', en:'Bahrain', natAr:'بحريني', natEn:'Bahraini' },
    { ar:'عُمان', en:'Oman', natAr:'عُماني', natEn:'Omani' },
    { ar:'اليمن', en:'Yemen', natAr:'يمني', natEn:'Yemeni' },
    { ar:'مصر', en:'Egypt', natAr:'مصري', natEn:'Egyptian' },
    { ar:'الأردن', en:'Jordan', natAr:'أردني', natEn:'Jordanian' },
    { ar:'لبنان', en:'Lebanon', natAr:'لبناني', natEn:'Lebanese' },
    { ar:'سوريا', en:'Syria', natAr:'سوري', natEn:'Syrian' },
    { ar:'العراق', en:'Iraq', natAr:'عراقي', natEn:'Iraqi' },
    { ar:'فلسطين', en:'Palestine', natAr:'فلسطيني', natEn:'Palestinian' },
    { ar:'السودان', en:'Sudan', natAr:'سوداني', natEn:'Sudanese' },
    { ar:'ليبيا', en:'Libya', natAr:'ليبي', natEn:'Libyan' },
    { ar:'تونس', en:'Tunisia', natAr:'تونسي', natEn:'Tunisian' },
    { ar:'الجزائر', en:'Algeria', natAr:'جزائري', natEn:'Algerian' },
    { ar:'المغرب', en:'Morocco', natAr:'مغربي', natEn:'Moroccan' },
    { ar:'موريتانيا', en:'Mauritania', natAr:'موريتاني', natEn:'Mauritanian' },
    { ar:'الصومال', en:'Somalia', natAr:'صومالي', natEn:'Somali' },
    { ar:'جيبوتي', en:'Djibouti', natAr:'جيبوتي', natEn:'Djiboutian' },
    { ar:'جزر القمر', en:'Comoros', natAr:'قمري', natEn:'Comorian' },
    { ar:'تركيا', en:'Turkey', natAr:'تركي', natEn:'Turkish' },
    { ar:'إيران', en:'Iran', natAr:'إيراني', natEn:'Iranian' },
    { ar:'أفغانستان', en:'Afghanistan', natAr:'أفغاني', natEn:'Afghan' },
    { ar:'باكستان', en:'Pakistan', natAr:'باكستاني', natEn:'Pakistani' },
    { ar:'الهند', en:'India', natAr:'هندي', natEn:'Indian' },
    { ar:'بنغلاديش', en:'Bangladesh', natAr:'بنغلاديشي', natEn:'Bangladeshi' },
    { ar:'سريلانكا', en:'Sri Lanka', natAr:'سريلانكي', natEn:'Sri Lankan' },
    { ar:'نيبال', en:'Nepal', natAr:'نيبالي', natEn:'Nepali' },
    { ar:'الفلبين', en:'Philippines', natAr:'فلبيني', natEn:'Filipino' },
    { ar:'إندونيسيا', en:'Indonesia', natAr:'إندونيسي', natEn:'Indonesian' },
    { ar:'ماليزيا', en:'Malaysia', natAr:'ماليزي', natEn:'Malaysian' },
    { ar:'تايلاند', en:'Thailand', natAr:'تايلاندي', natEn:'Thai' },
    { ar:'الصين', en:'China', natAr:'صيني', natEn:'Chinese' },
    { ar:'اليابان', en:'Japan', natAr:'ياباني', natEn:'Japanese' },
    { ar:'كوريا الجنوبية', en:'South Korea', natAr:'كوري جنوبي', natEn:'South Korean' },
    { ar:'الولايات المتحدة', en:'United States', natAr:'أمريكي', natEn:'American' },
    { ar:'كندا', en:'Canada', natAr:'كندي', natEn:'Canadian' },
    { ar:'المملكة المتحدة', en:'United Kingdom', natAr:'بريطاني', natEn:'British' },
    { ar:'فرنسا', en:'France', natAr:'فرنسي', natEn:'French' },
    { ar:'ألمانيا', en:'Germany', natAr:'ألماني', natEn:'German' },
    { ar:'إيطاليا', en:'Italy', natAr:'إيطالي', natEn:'Italian' },
    { ar:'إسبانيا', en:'Spain', natAr:'إسباني', natEn:'Spanish' },
    { ar:'هولندا', en:'Netherlands', natAr:'هولندي', natEn:'Dutch' },
    { ar:'روسيا', en:'Russia', natAr:'روسي', natEn:'Russian' },
    { ar:'أوكرانيا', en:'Ukraine', natAr:'أوكراني', natEn:'Ukrainian' },
    { ar:'جنوب أفريقيا', en:'South Africa', natAr:'جنوب أفريقي', natEn:'South African' },
    { ar:'نيجيريا', en:'Nigeria', natAr:'نيجيري', natEn:'Nigerian' },
    { ar:'كينيا', en:'Kenya', natAr:'كيني', natEn:'Kenyan' },
    { ar:'إثيوبيا', en:'Ethiopia', natAr:'إثيوبي', natEn:'Ethiopian' },
    { ar:'أستراليا', en:'Australia', natAr:'أسترالي', natEn:'Australian' },
    { ar:'البرازيل', en:'Brazil', natAr:'برازيلي', natEn:'Brazilian' },
    { ar:'أخرى', en:'Other', natAr:'أخرى', natEn:'Other' },
  ];

  function countryName(c){ return I18N.getLang()==='ar' ? c.ar : c.en; }
  function nationalityName(c){ return I18N.getLang()==='ar' ? c.natAr : c.natEn; }

  // <select> of country names (for Clients → Country)
  function countryOptions(selected){
    return `<option value="">—</option>` + COUNTRIES.map(c=>{
      const val = countryName(c);
      return `<option value="${val}" ${selected===val?'selected':''}>${val}</option>`;
    }).join('');
  }

  // <select> of nationality demonyms (for Technicians → Nationality)
  function nationalityOptions(selected){
    return `<option value="">—</option>` + COUNTRIES.map(c=>{
      const val = nationalityName(c);
      return `<option value="${val}" ${selected===val?'selected':''}>${val}</option>`;
    }).join('');
  }

  return { COUNTRIES, countryOptions, nationalityOptions };
})();
