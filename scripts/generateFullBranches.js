const fs = require('fs');
const path = require('path');

// ─── BANGLADESH GEOGRAPHY & PUBALI REGIONS ──────────────────────
const DIVISIONS = [
  {
    name: 'Dhaka',
    zones: [
      { name: 'Dhaka Central', code: 'RO-DHK-C', districts: ['Dhaka'] },
      { name: 'Dhaka North', code: 'RO-DHK-N', districts: ['Dhaka'] },
      { name: 'Dhaka South', code: 'RO-DHK-S', districts: ['Dhaka'] },
      { name: 'Gazipur', code: 'RO-GZP', districts: ['Gazipur'] },
      { name: 'Narayanganj', code: 'RO-NRG', districts: ['Narayanganj', 'Munshiganj'] },
      { name: 'Narsingdi', code: 'RO-NSD', districts: ['Narsingdi', 'Kishoreganj'] },
      { name: 'Tangail', code: 'RO-TNG', districts: ['Tangail', 'Manikganj'] },
      { name: 'Faridpur', code: 'RO-FRP', districts: ['Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'] }
    ]
  },
  {
    name: 'Chattogram',
    zones: [
      { name: 'Chattogram Central', code: 'RO-CTG-C', districts: ['Chattogram'] },
      { name: 'Chattogram North', code: 'RO-CTG-N', districts: ['Chattogram', 'Khagrachhari'] },
      { name: 'Chattogram South', code: 'RO-CTG-S', districts: ['Chattogram', 'Cox\'s Bazar', 'Bandarban', 'Rangamati'] },
      { name: 'Cumilla', code: 'RO-CML', districts: ['Cumilla', 'Brahmanbaria', 'Chandpur'] },
      { name: 'Noakhali', code: 'RO-NKH', districts: ['Noakhali', 'Feni', 'Lakshmipur'] }
    ]
  },
  {
    name: 'Sylhet',
    zones: [
      { name: 'Sylhet East', code: 'RO-SYL-E', districts: ['Sylhet'] },
      { name: 'Sylhet West', code: 'RO-SYL-W', districts: ['Sylhet', 'Sunamganj'] },
      { name: 'Moulvibazar', code: 'RO-MLB', districts: ['Moulvibazar'] },
      { name: 'Habiganj', code: 'RO-HBG', districts: ['Habiganj'] }
    ]
  },
  {
    name: 'Rajshahi',
    zones: [
      { name: 'Rajshahi', code: 'RO-RAJ', districts: ['Rajshahi', 'Natore', 'Chapainawabganj'] },
      { name: 'Bogura', code: 'RO-BOG', districts: ['Bogura', 'Joypurhat', 'Naogaon'] },
      { name: 'Pabna', code: 'RO-PAB', districts: ['Pabna', 'Sirajganj'] }
    ]
  },
  {
    name: 'Khulna',
    zones: [
      { name: 'Khulna', code: 'RO-KLN', districts: ['Khulna', 'Bagerhat', 'Satkhira'] },
      { name: 'Jashore', code: 'RO-JSR', districts: ['Jashore', 'Jhenaidah', 'Magura', 'Narail'] },
      { name: 'Kushtia', code: 'RO-KST', districts: ['Kushtia', 'Chuadanga', 'Meherpur'] }
    ]
  },
  {
    name: 'Barishal',
    zones: [
      { name: 'Barishal', code: 'RO-BAR', districts: ['Barishal', 'Jhalokathi', 'Pirojpur'] },
      { name: 'Patuakhali', code: 'RO-PAT', districts: ['Patuakhali', 'Bhola', 'Barguna'] }
    ]
  },
  {
    name: 'Rangpur',
    zones: [
      { name: 'Rangpur', code: 'RO-RNG', districts: ['Rangpur', 'Kurigram', 'Gaibandha', 'Lalmonirhat'] },
      { name: 'Dinajpur', code: 'RO-DNJ', districts: ['Dinajpur', 'Nilphamari', 'Thakurgaon', 'Panchagarh'] }
    ]
  },
  {
    name: 'Mymensingh',
    zones: [
      { name: 'Mymensingh', code: 'RO-MYM', districts: ['Mymensingh', 'Netrokona'] },
      { name: 'Jamalpur', code: 'RO-JML', districts: ['Jamalpur', 'Sherpur'] }
    ]
  }
];

// Major locations/upazilas per district to build authentic branch names
const DISTRICT_LOCALITIES = {
  // Dhaka
  'Dhaka': [
    'Motijheel Principal', 'Motijheel Corporate', 'Dilkusha Corporate', 'Ramna', 'Nawabpur Road', 'Bangshal', 
    'Chawkbazar', 'Sadarghat', 'Islampur', 'Babu Bazar', 'Mitford', 'Wari', 'Shantinagar', 'Malibagh', 
    'Kakrail', 'Fakirapool', 'Segunbagicha', 'Bijoynagar', 'Paltan', 'Elephant Road', 'New Market', 'Dhanmondi', 
    'Kalabagan', 'Panthapath', 'Green Road', 'Lalbagh', 'Azimpur', 'Hazaribagh', 'Kamrangirchar', 'Jatrabari', 
    'Sayedabad', 'Jurain', 'Postogola', 'Shyampur', 'Demra', 'Keraniganj', 'Hasnabad', 'Zinzira', 'Rohitpur', 
    'Gulshan', 'Gulshan Circle-2', 'Banani', 'Baridhara', 'Mohakhali', 'Tejgaon Industrial Area', 'Tejgaon Commercial', 
    'Kawran Bazar', 'Mirpur Section-1', 'Mirpur Section-2', 'Mirpur Section-10', 'Mirpur Section-11', 'Mirpur Section-12', 
    'Pallabi', 'Kafrul', 'Dhaka Cantonment', 'Uttara Model Town', 'Uttara Sector-3', 'Uttara Sector-7', 'Uttara Sector-9', 
    'Khilkhet', 'Nikunja', 'Bashundhara R/A', 'Badda', 'Middle Badda', 'Rampura', 'Banasree', 'Khilgaon', 'Moghbazar', 
    'Savar Bazar', 'Savar Cantonment', 'Ashulia', 'DEPZ Baipail', 'Dhamrai'
  ],
  'Gazipur': [
    'Joydebpur Main', 'Tongi Bazar', 'Tongi Industrial Area', 'Board Bazar', 'Konabari', 'Kashimpur', 'Chowrasta', 
    'Chandona', 'Sreepur', 'Mawna Chowrasta', 'Kaliakair', 'Safipur', 'Kapasia', 'Kaliganj'
  ],
  'Narayanganj': [
    'Narayanganj Main', 'Tanbazar', 'Netaiganj', 'Chasara', 'Fatullah', 'Pagla', 'Siddhirganj', 'Adamjee EPZ', 
    'Kanchpur', 'Sonargaon', 'Mograpara', 'Araihazar', 'Gopaldi', 'Rupganj', 'Bhulta Gawchia', 'Murapara'
  ],
  'Munshiganj': [
    'Munshiganj Sadar', 'Mirkadim', 'Sirajdikhan', 'Srinagar', 'Louhajang', 'Mawa Ghat', 'Tongibari', 'Gazaria'
  ],
  'Narsingdi': [
    'Narsingdi Main', 'Madhabdi Corporate', 'Baburhat', 'Shibpur', 'Monohardi', 'Belabo', 'Raipura', 'Palash', 'Ghorashal'
  ],
  'Kishoreganj': [
    'Kishoreganj Main', 'Bhairab Bazar Corporate', 'Bhairab Port', 'Bajitpur', 'Katiadi', 'Karimganj', 'Pakundia', 'Hossainpur', 'Kuliarchar'
  ],
  'Tangail': [
    'Tangail Main', 'Mirzapur', 'Gorai Industrial', 'Madhupur', 'Gopalpur', 'Ghatail', 'Sakhipur', 'Kalihati', 'Bhuapur', 'Nagarpur', 'Basail'
  ],
  'Manikganj': [
    'Manikganj Main', 'Singair', 'Saturia', 'Shibaloy', 'Aricha Ghat', 'Harirampur', 'Ghior'
  ],
  'Faridpur': [
    'Faridpur Main', 'Mujib Sadar Road', 'Bhanga Junction', 'Boalmari', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Alfadanga', 'Charbhadrasan'
  ],
  'Gopalganj': [
    'Gopalganj Main', 'Tungipara', 'Kotalipara', 'Muksudpur', 'Kashiani'
  ],
  'Madaripur': [
    'Madaripur Main', 'Puran Bazar', 'Shibchar', 'Kalkini', 'Rajoir'
  ],
  'Rajbari': [
    'Rajbari Main', 'Pangsha', 'Goalando Ghat', 'Kalukhali', 'Baliakandi'
  ],
  'Shariatpur': [
    'Shariatpur Main', 'Naria', 'Damudya', 'Bhedarganj', 'Zajira', 'Gosairhat'
  ],

  // Chattogram
  'Chattogram': [
    'Agrabad Corporate', 'Agrabad Commercial Area', 'Khatunganj Commercial', 'Jubilee Road', 'Kotwali', 'Anderkilla', 
    'Laldighi', 'Chawkbazar', 'Panchlaish', 'Nasirabad Industrial', 'GEC Circle', 'Muradpur', 'Bahaddarhat', 'Halishahar H/E', 
    'Pahartali', 'Colonel Hat', 'Dewanhat', 'Kadurkheel', 'Sitakunda', 'Bhatiary', 'Kumira', 'Barabkunda', 'Hathazari', 
    'Fatikchhari', 'Nazirhat', 'Raozan', 'Pahartali University', 'Rangunia', 'Sandwip', 'Mirsarai', 'Baraiyarhat', 'Patiya', 
    'Anwara', 'Boalkhali', 'Chandanaish', 'Dohazari', 'Satkania', 'Keranihat', 'Lohagara', 'Banshkhali'
  ],
  'Cox\'s Bazar': [
    'Cox\'s Bazar Main', 'Hotel Motel Zone', 'Teknaf Border Port', 'Ramu', 'Chakaria', 'Dulahazara', 'Ukhiya', 'Kutubdia', 'Maheshkhali'
  ],
  'Cumilla': [
    'Cumilla Main', 'Kandirpar Corporate', 'Tomchom Bridge', 'EPZ Cumilla', 'Laksham Junction', 'Daudkandi', 'Gouripur', 
    'Chauddagram', 'Debidwar', 'Homna', 'Chandina', 'Muradnagar', 'Burichang', 'Brahmanpara', 'Barura'
  ],
  'Brahmanbaria': [
    'Brahmanbaria Main', 'Ashuganj Port', 'Kasba Border', 'Nabinagar', 'Bancharampur', 'Sarail', 'Akhaura Railway Junction', 'Nasirnagar'
  ],
  'Chandpur': [
    'Chandpur Main', 'Puran Bazar Port', 'Hajiganj Commercial', 'Faridganj', 'Matlab Uttar', 'Matlab Dakshin', 'Shahrasti', 'Kachua'
  ],
  'Noakhali': [
    'Maijdee Court', 'Chowmuhani Corporate', 'Begumganj', 'Senbagh', 'Chatkhil', 'Companiganj', 'Basurhat', 'Sonaimuri', 'Hatiya Island'
  ],
  'Feni': [
    'Feni Main', 'Trunk Road', 'Daganbhuiyan', 'Chhagalnaiya', 'Parshuram', 'Sonagazi', 'Fulgazi'
  ],
  'Lakshmipur': [
    'Lakshmipur Main', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'
  ],
  'Khagrachhari': ['Khagrachhari Sadar', 'Dighinala', 'Matiranga', 'Ramgarh'],
  'Rangamati': ['Rangamati Sadar', 'Kaptai', 'Baghaichhari', 'Kawkhali'],
  'Bandarban': ['Bandarban Sadar', 'Lama', 'Ruma', 'Thanchi'],

  // Sylhet
  'Sylhet': [
    'Sylhet Main (Bandarbazar)', 'Zindabazar Corporate', 'Amberkhana Point', 'Dargah Gate', 'Shibganj', 'Subidbazar', 
    'Kadamtali Bus Terminal', 'South Surma', 'Lalbazar', 'Golapganj', 'Dhaka Dakshin', 'Beanibazar Corporate', 'Jaintiapur', 
    'Tamabil Land Port', 'Kanaighat', 'Zakiganj Border', 'Fenchuganj Fertilizer', 'Balaganj', 'Biswanath', 'Osmani Nagar', 
    'Tajpur', 'Gowainghat', 'Jaflong'
  ],
  'Moulvibazar': [
    'Moulvibazar Main', 'Chowmuhana', 'Sreemangal Tea City', 'Kulaura Junction', 'Barlekha', 'Kamalganj', 'Shamshernagar', 
    'Rajnagar', 'Juri Valley'
  ],
  'Habiganj': [
    'Habiganj Main', 'Shaistaganj Junction', 'Madhabpur Industrial', 'Sayham Textile Area', 'Nabiganj', 'Goplar Bazar', 
    'Bahubal', 'Chunarughat', 'Baniachong', 'Ajmiriganj'
  ],
  'Sunamganj': [
    'Sunamganj Main', 'Chhatak Cement Town', 'Jagannathpur', 'Derai', 'Tahirpur', 'Doarabazar', 'Jamalganj', 'Dharmapasha'
  ],

  // Rajshahi
  'Rajshahi': [
    'Rajshahi Corporate', 'Shaheb Bazar', 'Alupatti Point', 'Kazihata', 'Station Road', 'Paba', 'Nowhata', 'Godagari', 
    'Premtoli', 'Tanore', 'Bagha', 'Charghat', 'Durgapur', 'Puthia', 'Bagmara'
  ],
  'Bogura': [
    'Bogura Main', 'Raja Bazar Corporate', 'Borogola', 'Sherpur', 'Shibganj', 'Santahar Railway Junction', 'Gabtali', 
    'Dupchanchia', 'Kahaloo', 'Nandigram', 'Sonatola'
  ],
  'Pabna': [
    'Pabna Main', 'Abdul Hamid Road', 'Ishwardi Commercial', 'Rooppur Atomic Gate', 'Bera Bazar', 'Kashinathpur', 
    'Santhia', 'Chatmohar', 'Sujanagar', 'Atgharia', 'Bhangura'
  ],
  'Sirajganj': [
    'Sirajganj Main', 'S.S. Road', 'Shahjadpur Textile', 'Ullapara', 'Belkuchi Handloom Hub', 'Kamarkhanda', 'Kazipur', 
    'Tarash', 'Raiganj'
  ],
  'Natore': [
    'Natore Main', 'Kanaikhali', 'Singra', 'Baraigram', 'Bonpara Highway', 'Lalpur', 'Gopalpur Sugar', 'Gurudaspur'
  ],
  'Naogaon': [
    'Naogaon Main', 'Chowdhury Mor', 'Mohadevpur Rice Hub', 'Patnitala', 'Manda', 'Dhamoirhat', 'Raninagar', 'Badalgachhi', 'Atrai'
  ],
  'Joypurhat': [
    'Joypurhat Main', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur'
  ],
  'Chapainawabganj': [
    'Chapainawabganj Main', 'Shibganj Mango Market', 'Kansat', 'Gomastapur', 'Rohanpur Port', 'Bholahat', 'Nachole'
  ],

  // Khulna
  'Khulna': [
    'Khulna Corporate', 'Sir Iqbal Road', 'Daulatpur Commercial', 'Khalishpur Industrial', 'Rupsha Ferry Ghat', 
    'Phultala', 'Dumuria', 'Batiaghata', 'Paikgachha', 'Dakop', 'Koyra'
  ],
  'Jashore': [
    'Jashore Main', 'Garib Shah Road', 'Benapole Land Port', 'Jhikargachha', 'Keshabpur', 'Chowgacha', 'Bagherpara', 
    'Abhaynagar (Noapara Port)', 'Manirampur'
  ],
  'Kushtia': [
    'Kushtia Main', 'NS Road', 'Poradah Junction', 'Bheramara Power', 'Kumarkhali Handloom', 'Mirpur', 'Daulatpur Border'
  ],
  'Jhenaidah': [
    'Jhenaidah Main', 'Kaliganj Sugarmill', 'Kotchandpur', 'Maheshpur Border', 'Harinakunda', 'Shailkupa'
  ],
  'Bagerhat': [
    'Bagerhat Main', 'Mongla Port Commercial', 'Morrelganj', 'Fakirhat', 'Rampal Power Zone', 'Kachua', 'Chitalmari'
  ],
  'Satkhira': [
    'Satkhira Main', 'Bhomra Land Port', 'Kalaroa', 'Tala', 'Shyamnagar', 'Kaliganj', 'Debhata', 'Assasuni'
  ],
  'Chuadanga': [
    'Chuadanga Main', 'Darshana Land Port', 'Alamdanga', 'Damurhuda', 'Jibannagar'
  ],
  'Meherpur': ['Meherpur Main', 'Gangni', 'Mujibnagar Historic'],
  'Magura': ['Magura Main', 'Sreepur', 'Mohammadpur', 'Shalikha'],
  'Narail': ['Narail Main', 'Lohagara', 'Kalia'],

  // Barishal
  'Barishal': [
    'Barishal Corporate', 'Sadar Road', 'Natun Bazar', 'Rupatali Terminal', 'Bakerganj', 'Gournadi Highway', 
    'Wazirpur', 'Banaripara', 'Mehendiganj', 'Babuganj', 'Muladi'
  ],
  'Bhola': [
    'Bhola Main', 'Borhanuddin Gas Field', 'Char Fasson', 'Lalmohan', 'Daulatkhan', 'Tazumuddin', 'Monpura'
  ],
  'Patuakhali': [
    'Patuakhali Main', 'Galachipa', 'Kuakata Sea Beach', 'Bauphal', 'Kalapara (Payra Port)', 'Mirzaganj', 'Dumki'
  ],
  'Pirojpur': [
    'Pirojpur Main', 'Bhandaria', 'Mathbaria Coastal', 'Nesarabad (Swarupkathi Timber)', 'Kawkhali', 'Nazirpur', 'Zianagar'
  ],
  'Jhalokathi': ['Jhalokathi Main', 'Nalchity', 'Rajapur', 'Kathalia'],
  'Barguna': ['Barguna Main', 'Amtali', 'Patharghata Fisheries', 'Betagi', 'Bamna', 'Taltali'],

  // Rangpur
  'Rangpur': [
    'Rangpur Corporate', 'Station Road', 'Jahaj Company Mor', 'Modern Mor', 'Badarganj Sugar', 'Mithapukur', 
    'Pirganj', 'Taraganj', 'Gangachhara', 'Kaunia Junction'
  ],
  'Dinajpur': [
    'Dinajpur Main', 'Maldapatty', 'Saidpur Road', 'Parbatipur Railway Junction', 'Birganj', 'Fulbari Coal Basin', 
    'Ghoraghat', 'Hakimpur (Hili Port)', 'Birol Land Port', 'Bochaganj', 'Kaharole'
  ],
  'Gaibandha': [
    'Gaibandha Main', 'D.B. Road', 'Gobindaganj Highway', 'Palashbari', 'Sundarganj', 'Sadullapur', 'Saghatta', 'Phulchhari'
  ],
  'Kurigram': [
    'Kurigram Main', 'Nageshwari', 'Ulipur', 'Chilmari River Port', 'Bhurungamari Border', 'Rajarhat', 'Phulbari', 'Rowmari'
  ],
  'Nilphamari': [
    'Nilphamari Main', 'Saidpur Commercial', 'Saidpur Railway Workshop', 'Domar', 'Dimla', 'Jaldhaka', 'Kishoreganj'
  ],
  'Lalmonirhat': [
    'Lalmonirhat Main', 'Mission Mor', 'Patgram', 'Burimari Land Port', 'Kaliganj', 'Aditmari', 'Hatibandha'
  ],
  'Thakurgaon': [
    'Thakurgaon Main', 'Old Bus Stand', 'Pirganj', 'Ranisankail', 'Haripur', 'Baliadangi'
  ],
  'Panchagarh': [
    'Panchagarh Main', 'Tetulia Banglabandha Port', 'Boda', 'Debiganj', 'Atwari'
  ],

  // Mymensingh
  'Mymensingh': [
    'Mymensingh Corporate', 'Choto Bazar', 'Ganginar Par', 'Station Road', 'Muktagachha', 'Trishal (Kabi Nazrul)', 
    'Bhaluka Industrial', 'Masterbari Highway', 'Phulpur', 'Gafargaon', 'Ishwarganj', 'Haluaghat Border', 'Dhobaura', 'Nandail'
  ],
  'Jamalpur': [
    'Jamalpur Main', 'Station Road', 'Sarishabari Jute Hub', 'Melandaha', 'Islampur', 'Dewanganj Sugar', 'Madarganj', 'Baksiganj'
  ],
  'Sherpur': [
    'Sherpur Main', 'Raghunath Bazar', 'Nalitabari Nakugaon Port', 'Nakla', 'Jhenaigati', 'Sreebardi'
  ],
  'Netrokona': [
    'Netrokona Main', 'Choto Bazar', 'Mohanganj Haor', 'Kendua', 'Durgapur Birishiri', 'Purbadhala', 'Kalmakanda Border', 'Barhatta', 'Madan'
  ]
};

// Suprema device catalog
const SUPREMA_MODELS = [
  { model: 'FaceStation F2', code: 'FSF2-AB', type: 'Face & Fingerprint Fusion', icon: 'ScanFace' },
  { model: 'BioStation 3', code: 'BS3-APW', type: 'AI Face & Mobile Access', icon: 'Smartphone' },
  { model: 'BioStation 2a', code: 'BS2A-OEP', type: 'AI Fingerprint Terminal', icon: 'Fingerprint' },
  { model: 'BioLite N2', code: 'BLN2-PAB', type: 'Outdoor IP67 Biometric', icon: 'ShieldCheck' },
  { model: 'FaceLite', code: 'FL-DB', type: 'Compact Face Recognition', icon: 'Smile' },
  { model: 'BioEntry W2', code: 'BEW2-OHP', type: 'Vandal IP67 Fingerprint', icon: 'Lock' },
  { model: 'X-Station 2', code: 'XS2-QAPB', type: 'RFID & QR Terminal', icon: 'QrCode' }
];

const MANAGERS = [
  'Md. Nazrul Islam (DGM)', 'Kazi Farhana Akhter (AGM)', 'Syed Tanvir Hasan (DGM)', 'Arifur Rahman Chowdhury (SVP)',
  'Ferdous Ahmed (VP)', 'Mustafa Mahmud (AVP)', 'Nasir Uddin Chowdhury (VP)', 'A.K.M. Shamsuddin (SVP)',
  'Tariqul Islam Bhuiyan (AGM)', 'Mohiuddin Ahmed (VP)', 'Ziaul Karim (AVP)', 'Shamsul Alam (SVP)',
  'M. A. Matin (DGM)', 'Rafiqul Islam Khan (VP)', 'Mahbubul Alam (AGM)', 'Golam Sarwar (AVP)',
  'Nurul Huda (SVP)', 'Matiur Rahman (VP)', 'Abdur Rashid (AGM)', 'Shafiqul Haque (AVP)',
  'Asaduzzaman (SVP)', 'Farid Uddin Ahmed (VP)', 'Aminul Islam (AGM)', 'Enamul Kabir (AVP)'
];

const STATUSES = ['Online', 'Online', 'Online', 'Online', 'Online', 'Online', 'Online', 'Online', 'Offline', 'Sync Issue'];

// Target counts:
const TARGET_BRANCHES = 519;
const TARGET_SUBBRANCHES = 281;
const TARGET_ISLAMIC = 29;

console.log('Generating Pubali Bank Locations:');
console.log(`Target: ${TARGET_BRANCHES} Branches, ${TARGET_SUBBRANCHES} Sub-branches, ${TARGET_ISLAMIC} Islamic Units = ${TARGET_BRANCHES + TARGET_SUBBRANCHES + TARGET_ISLAMIC} Total`);

// Collect all localities across districts
const allLocalities = [];
for (const [district, localities] of Object.entries(DISTRICT_LOCALITIES)) {
  // Find which zone and division contains this district
  let foundDiv = null;
  let foundZone = null;
  for (const div of DIVISIONS) {
    for (const zone of div.zones) {
      if (zone.districts.includes(district)) {
        foundDiv = div.name;
        foundZone = zone.name;
        break;
      }
    }
    if (foundZone) break;
  }
  if (!foundZone) {
    foundDiv = 'Dhaka';
    foundZone = 'Dhaka Central';
  }

  for (const loc of localities) {
    allLocalities.push({
      locality: loc,
      district,
      division: foundDiv,
      zone: foundZone
    });
  }
}

console.log(`Available unique localities mapped: ${allLocalities.length}`);

// We need 519 branch names. We have ~400 unique localities; for the rest, we create authentic second/corporate/bazar extensions
const branches = [];
let branchCodeSeq = 101;

// 1. Head Office (First Branch)
branches.push({
  id: 'PB-LOC-0101',
  name: 'Head Office (Principal Branch)',
  code: '0101',
  routingNumber: '175260101',
  type: 'head-office',
  typeLabel: 'Head Office',
  division: 'Dhaka',
  district: 'Dhaka',
  zone: 'Dhaka Central',
  address: '26 Dilkusha C/A, Motijheel, Dhaka-1000',
  phone: '+880 2-223381614',
  manager: 'Mohammad Nazrul Islam (DGM)',
  status: 'Online',
  doors: 48,
  attendance: { present: 812, total: 840 },
  devices: [
    { id: 'DEV-HO-01', name: 'FaceStation F2', model: 'FSF2-AB', serial: 'SUP-00101-01', ip: '10.10.14.11', port: 51211, mac: '00:17:7D:9A:E1:01', status: 'Online', location: 'Main Entrance Turnstile', firmware: 'v1.4.2_2408' },
    { id: 'DEV-HO-02', name: 'BioStation 3', model: 'BS3-APW', serial: 'SUP-00101-02', ip: '10.10.14.12', port: 51211, mac: '00:17:7D:9A:E1:02', status: 'Online', location: 'Executive 5F Floor', firmware: 'v2.0.1_b12' },
    { id: 'DEV-HO-03', name: 'X-Station 2', model: 'XS2-QAPB', serial: 'SUP-00101-03', ip: '10.10.14.13', port: 51211, mac: '00:17:7D:9A:E1:03', status: 'Online', location: 'Data Center Airlock', firmware: 'v1.2.0_2402' },
    { id: 'DEV-HO-04', name: 'BioStation 2a', model: 'BS2A-OEP', serial: 'SUP-00101-04', ip: '10.10.14.14', port: 51211, mac: '00:17:7D:9A:E1:04', status: 'Online', location: 'Treasury Vault Door', firmware: 'v1.1.0_2405' }
  ],
  doorList: [
    { name: 'Main Lobby Turnstile', status: 'Locked', group: 'All HO Staff', sensor: 'Closed', type: 'Turnstile' },
    { name: 'Executive Suite Door', status: 'Locked', group: 'Board Members', sensor: 'Closed', type: 'Fail-Secure' },
    { name: 'Data Center Airlock', status: 'Locked', group: 'IT Division', sensor: 'Closed', type: 'Interlock' },
    { name: 'Treasury Main Vault', status: 'Locked', group: 'Treasury Staff', sensor: 'Closed', type: 'Time-Lock' }
  ],
  employees: [
    { id: 'PB-09101', name: 'Mohammad Nazrul Islam', status: 'Present', inTime: '08:30', late: false },
    { id: 'PB-09102', name: 'Kamrun Nahar', status: 'Present', inTime: '08:55', late: false },
    { id: 'PB-09105', name: 'Ismail Hossain', status: 'Late', inTime: '09:18', late: true },
    { id: 'PB-09112', name: 'Syeda Afroza Begum', status: 'Present', inTime: '08:44', late: false },
    { id: 'PB-09120', name: 'Mustafizur Rahman', status: 'Absent', inTime: '—', late: false }
  ]
});

let locIdx = 0;
while (branches.length < TARGET_BRANCHES) {
  const loc = allLocalities[locIdx % allLocalities.length];
  locIdx++;

  branchCodeSeq++;
  const codeStr = String(branchCodeSeq).padStart(4, '0');
  
  // Suffix modifier if needed for multiple branches in a district
  const repeat = Math.floor(locIdx / allLocalities.length);
  let bName = loc.locality;
  if (!bName.includes('Branch') && !bName.includes('Corporate') && !bName.includes('Principal')) {
    if (repeat === 0) {
      bName = `${bName} Branch`;
    } else if (repeat === 1) {
      bName = `${bName} Bazar Branch`;
    } else {
      bName = `${bName} SME Branch`;
    }
  }

  // Routing number: 175 (Pubali) + 2 digits district/zone code + 4 digits branch code
  const distHash = Math.abs(loc.district.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 70 + 10;
  const routing = `175${distHash}${codeStr.slice(-4)}`;

  const dev1 = SUPREMA_MODELS[(branchCodeSeq * 3) % SUPREMA_MODELS.length];
  const dev2 = SUPREMA_MODELS[(branchCodeSeq * 5 + 1) % SUPREMA_MODELS.length];
  const status = STATUSES[branchCodeSeq % STATUSES.length];
  const mgr = MANAGERS[branchCodeSeq % MANAGERS.length];
  const totalEmp = 15 + (branchCodeSeq % 35);
  const presentEmp = status === 'Offline' ? Math.floor(totalEmp * 0.4) : Math.floor(totalEmp * 0.92);
  const doorCount = 4 + (branchCodeSeq % 8);

  const ipSubnet = 10 + (branchCodeSeq % 80);
  const ipHost = 10 + (branchCodeSeq % 200);

  branches.push({
    id: `PB-LOC-${codeStr}`,
    name: bName,
    code: codeStr,
    routingNumber: routing,
    type: 'branch',
    typeLabel: 'Full Branch',
    division: loc.division,
    district: loc.district,
    zone: loc.zone,
    address: `${loc.locality} Commercial Hub, ${loc.district}`,
    phone: `+880 17${10 + (branchCodeSeq % 80)}-${100000 + (branchCodeSeq * 179) % 899999}`,
    manager: mgr,
    status: status,
    doors: doorCount,
    attendance: { present: presentEmp, total: totalEmp },
    devices: [
      {
        id: `DEV-${codeStr}-01`,
        name: dev1.model,
        model: dev1.code,
        serial: `SUP-${codeStr}-01`,
        ip: `10.${ipSubnet}.${(branchCodeSeq % 30) + 10}.${ipHost}`,
        port: 51211,
        mac: `00:17:7D:9A:${(branchCodeSeq % 89 + 10).toString(16).toUpperCase()}:01`,
        status: status,
        location: 'Branch Main Entry & Cash Vault',
        firmware: 'v1.4.2_2408'
      },
      {
        id: `DEV-${codeStr}-02`,
        name: dev2.model,
        model: dev2.code,
        serial: `SUP-${codeStr}-02`,
        ip: `10.${ipSubnet}.${(branchCodeSeq % 30) + 10}.${ipHost + 1}`,
        port: 51211,
        mac: `00:17:7D:9A:${(branchCodeSeq % 89 + 10).toString(16).toUpperCase()}:02`,
        status: status === 'Offline' ? 'Offline' : 'Online',
        location: 'Manager Cabin & Server Room',
        firmware: 'v2.0.1_b12'
      }
    ],
    doorList: [
      { name: 'Main Entry Barrier', status: 'Locked', group: 'All Branch Staff', sensor: 'Closed', type: 'Mag Lock' },
      { name: 'Cash Counter Cage', status: 'Locked', group: 'Cash Officers', sensor: 'Closed', type: 'Mag Lock' },
      { name: 'Strong Room Vault', status: 'Locked', group: 'Vault Custodians', sensor: 'Closed', type: 'Time-Lock' },
      { name: 'Server & UPS Room', status: 'Locked', group: 'IT & Operations', sensor: 'Closed', type: 'Interlock' }
    ],
    employees: [
      { id: `PB-${codeStr}1`, name: mgr.split(' (')[0], status: 'Present', inTime: '08:42', late: false },
      { id: `PB-${codeStr}2`, name: 'Farzana Yesmin', status: 'Present', inTime: '08:49', late: false },
      { id: `PB-${codeStr}3`, name: 'Tanvir Ahmed', status: status === 'Offline' ? 'Absent' : 'Present', inTime: '09:12', late: true },
      { id: `PB-${codeStr}4`, name: 'Rokeya Begum', status: 'Present', inTime: '08:35', late: false }
    ]
  });
}

// 2. Sub-branches (Upashakha) - Exactly 281
const subBranches = [];
for (let i = 1; i <= TARGET_SUBBRANCHES; i++) {
  const parentBranch = branches[i % branches.length];
  const sbCode = `SB-${1000 + i}`;
  const dev = SUPREMA_MODELS[i % SUPREMA_MODELS.length];
  const status = i % 23 === 0 ? 'Offline' : i % 37 === 0 ? 'Sync Issue' : 'Online';
  const totalEmp = 5 + (i % 8);
  const presentEmp = status === 'Offline' ? Math.floor(totalEmp * 0.5) : totalEmp - (i % 2);

  const routing = `175${parentBranch.routingNumber.slice(3, 5)}${sbCode.slice(-4)}`;

  subBranches.push({
    id: `PB-LOC-${sbCode}`,
    name: `${parentBranch.name.replace(/ Branch| Corporate| Principal/g, '')} Upashakha (${sbCode})`,
    code: sbCode,
    routingNumber: routing,
    type: 'sub-branch',
    typeLabel: 'Sub-Branch (Upashakha)',
    parentBranchCode: parentBranch.code,
    parentBranchName: parentBranch.name,
    division: parentBranch.division,
    district: parentBranch.district,
    zone: parentBranch.zone,
    address: `Upashakha Complex, Near ${parentBranch.address}`,
    phone: `+880 18${10 + (i % 80)}-${200000 + (i * 137) % 799999}`,
    manager: `Incharge: Officer ${1000 + i}`,
    status: status,
    doors: 2 + (i % 3),
    attendance: { present: presentEmp, total: totalEmp },
    devices: [
      {
        id: `DEV-${sbCode}-01`,
        name: dev.model,
        model: dev.code,
        serial: `SUP-${sbCode}-01`,
        ip: `10.80.${(i % 50) + 1}.${(i % 240) + 10}`,
        port: 51211,
        mac: `00:17:7D:9A:FB:${(i % 250).toString(16).padStart(2, '0').toUpperCase()}`,
        status: status,
        location: 'Upashakha Main Shutter & Cash Cabin',
        firmware: 'v1.3.0_2307'
      }
    ],
    doorList: [
      { name: 'Upashakha Shutter Gate', status: 'Locked', group: 'All Upashakha Staff', sensor: 'Closed', type: 'Mag Lock' },
      { name: 'Cash Counter Booth', status: 'Locked', group: 'Cashier & Incharge', sensor: 'Closed', type: 'Mag Lock' }
    ],
    employees: [
      { id: `PB-SB${i}1`, name: `Officer ${1000 + i}`, status: 'Present', inTime: '08:40', late: false },
      { id: `PB-SB${i}2`, name: `Cash Officer ${1000 + i}`, status: status === 'Offline' ? 'Absent' : 'Present', inTime: '08:52', late: false }
    ]
  });
}

// 3. Islamic Banking Units - Exactly 29
const islamicUnits = [];
const ISLAMIC_CENTERS = [
  { name: 'Islamic Banking Wing Motijheel', loc: 'Motijheel, Dhaka', div: 'Dhaka', dist: 'Dhaka', zone: 'Dhaka Central' },
  { name: 'Islamic Banking Window Dilkusha', loc: 'Dilkusha C/A, Dhaka', div: 'Dhaka', dist: 'Dhaka', zone: 'Dhaka Central' },
  { name: 'Islamic Banking Window Dhanmondi', loc: 'Road 27, Dhanmondi, Dhaka', div: 'Dhaka', dist: 'Dhaka', zone: 'Dhaka South' },
  { name: 'Islamic Banking Window Gulshan', loc: 'Gulshan Avenue, Dhaka', div: 'Dhaka', dist: 'Dhaka', zone: 'Dhaka North' },
  { name: 'Islamic Banking Window Uttara', loc: 'Sector 3, Uttara, Dhaka', div: 'Dhaka', dist: 'Dhaka', zone: 'Dhaka North' },
  { name: 'Islamic Banking Window Mirpur', loc: 'Mirpur-10 Circle, Dhaka', div: 'Dhaka', dist: 'Dhaka', zone: 'Dhaka North' },
  { name: 'Islamic Banking Window Agrabad', loc: 'Agrabad C/A, Chattogram', div: 'Chattogram', dist: 'Chattogram', zone: 'Chattogram Central' },
  { name: 'Islamic Banking Window Khatunganj', loc: 'Khatunganj Commercial, Chattogram', div: 'Chattogram', dist: 'Chattogram', zone: 'Chattogram Central' },
  { name: 'Islamic Banking Window Chawkbazar Ctg', loc: 'Chawkbazar, Chattogram', div: 'Chattogram', dist: 'Chattogram', zone: 'Chattogram Central' },
  { name: 'Islamic Banking Window Sylhet Main', loc: 'Bandarbazar, Sylhet', div: 'Sylhet', dist: 'Sylhet', zone: 'Sylhet East' },
  { name: 'Islamic Banking Window Ambarkhana', loc: 'Ambarkhana Point, Sylhet', div: 'Sylhet', dist: 'Sylhet', zone: 'Sylhet East' },
  { name: 'Islamic Banking Window Zindabazar', loc: 'Zindabazar, Sylhet', div: 'Sylhet', dist: 'Sylhet', zone: 'Sylhet East' },
  { name: 'Islamic Banking Window Rajshahi Shaheb Bazar', loc: 'Shaheb Bazar, Rajshahi', div: 'Rajshahi', dist: 'Rajshahi', zone: 'Rajshahi' },
  { name: 'Islamic Banking Window Bogura Borogola', loc: 'Borogola, Bogura', div: 'Rajshahi', dist: 'Bogura', zone: 'Bogura' },
  { name: 'Islamic Banking Window Khulna Sir Iqbal', loc: 'Sir Iqbal Road, Khulna', div: 'Khulna', dist: 'Khulna', zone: 'Khulna' },
  { name: 'Islamic Banking Window Jashore Main', loc: 'Garib Shah Road, Jashore', div: 'Khulna', dist: 'Jashore', zone: 'Jashore' },
  { name: 'Islamic Banking Window Barishal Sadar', loc: 'Sadar Road, Barishal', div: 'Barishal', dist: 'Barishal', zone: 'Barishal' },
  { name: 'Islamic Banking Window Rangpur Station', loc: 'Station Road, Rangpur', div: 'Rangpur', dist: 'Rangpur', zone: 'Rangpur' },
  { name: 'Islamic Banking Window Dinajpur Maldapatty', loc: 'Maldapatty, Dinajpur', div: 'Rangpur', dist: 'Dinajpur', zone: 'Dinajpur' },
  { name: 'Islamic Banking Window Mymensingh Choto Bazar', loc: 'Choto Bazar, Mymensingh', div: 'Mymensingh', dist: 'Mymensingh', zone: 'Mymensingh' },
  { name: 'Islamic Banking Window Cumilla Kandirpar', loc: 'Kandirpar, Cumilla', div: 'Chattogram', dist: 'Cumilla', zone: 'Cumilla' },
  { name: 'Islamic Banking Window Noakhali Chowmuhani', loc: 'Chowmuhani, Noakhali', div: 'Chattogram', dist: 'Noakhali', zone: 'Noakhali' },
  { name: 'Islamic Banking Window Feni Trunk Road', loc: 'Trunk Road, Feni', div: 'Chattogram', dist: 'Feni', zone: 'Noakhali' },
  { name: 'Islamic Banking Window Gazipur Chowrasta', loc: 'Chowrasta, Gazipur', div: 'Dhaka', dist: 'Gazipur', zone: 'Gazipur' },
  { name: 'Islamic Banking Window Narayanganj Chasara', loc: 'Chasara, Narayanganj', div: 'Dhaka', dist: 'Narayanganj', zone: 'Narayanganj' },
  { name: 'Islamic Banking Window Narsingdi Madhabdi', loc: 'Baburhat, Madhabdi, Narsingdi', div: 'Dhaka', dist: 'Narsingdi', zone: 'Narsingdi' },
  { name: 'Islamic Banking Window Moulvibazar Sreemangal', loc: 'Chowmuhana, Sreemangal', div: 'Sylhet', dist: 'Moulvibazar', zone: 'Moulvibazar' },
  { name: 'Islamic Banking Window Cox\'s Bazar', loc: 'Main Road, Cox\'s Bazar', div: 'Chattogram', dist: 'Cox\'s Bazar', zone: 'Chattogram South' },
  { name: 'Islamic Banking Window Kushtia NS Road', loc: 'NS Road, Kushtia', div: 'Khulna', dist: 'Kushtia', zone: 'Kushtia' }
];

for (let i = 0; i < TARGET_ISLAMIC; i++) {
  const item = ISLAMIC_CENTERS[i];
  const islCode = `ISL-${String(i + 1).padStart(3, '0')}`;
  const dev = SUPREMA_MODELS[i % 3]; // premium models for Islamic windows
  const routing = `17599${String(800 + i + 1)}`;
  const totalEmp = 8 + (i % 6);

  islamicUnits.push({
    id: `PB-LOC-${islCode}`,
    name: item.name,
    code: islCode,
    routingNumber: routing,
    type: 'islamic',
    typeLabel: 'Islamic Banking Unit',
    division: item.div,
    district: item.dist,
    zone: item.zone,
    address: `${item.loc}, Bangladesh`,
    phone: `+880 19${10 + (i % 80)}-${300000 + (i * 123) % 699999}`,
    manager: `Mufti Incharge #${i + 1}`,
    status: 'Online',
    doors: 3,
    attendance: { present: totalEmp - 1, total: totalEmp },
    devices: [
      {
        id: `DEV-${islCode}-01`,
        name: dev.model,
        model: dev.code,
        serial: `SUP-${islCode}-01`,
        ip: `10.90.${i + 1}.15`,
        port: 51211,
        mac: `00:17:7D:9A:FC:${(i + 10).toString(16).padStart(2, '0').toUpperCase()}`,
        status: 'Online',
        location: 'Shariah Banking Cabin & Locker',
        firmware: 'v1.4.2_2408'
      }
    ],
    doorList: [
      { name: 'Islamic Window Entry', status: 'Locked', group: 'Islamic Unit Staff', sensor: 'Closed', type: 'Mag Lock' },
      { name: 'Mudaraba Cash Vault', status: 'Locked', group: 'Islamic Officers', sensor: 'Closed', type: 'Time-Lock' }
    ],
    employees: [
      { id: `PB-ISL${i + 1}1`, name: `Mufti Incharge #${i + 1}`, status: 'Present', inTime: '08:35', late: false },
      { id: `PB-ISL${i + 1}2`, name: `Islamic Teller #${i + 1}`, status: 'Present', inTime: '08:48', late: false }
    ]
  });
}

// Combine all into unified list
const FULL_PUBALI_LOCATIONS = [
  ...branches,
  ...subBranches,
  ...islamicUnits
];

console.log(`Generated Locations Summary:`);
console.log(`- Branches: ${branches.length}`);
console.log(`- Sub-branches: ${subBranches.length}`);
console.log(`- Islamic Units: ${islamicUnits.length}`);
console.log(`- Total Locations: ${FULL_PUBALI_LOCATIONS.length}`);

// Generate Regional Offices list (27 Zones)
const REGIONAL_OFFICES = [];
for (const div of DIVISIONS) {
  for (const zone of div.zones) {
    const zoneBranches = branches.filter(b => b.zone === zone.name);
    const zoneSubBranches = subBranches.filter(s => s.zone === zone.name);
    const zoneIslamic = islamicUnits.filter(u => u.zone === zone.name);
    const allZoneLocs = FULL_PUBALI_LOCATIONS.filter(l => l.zone === zone.name);
    const onlineDevs = allZoneLocs.reduce((acc, l) => acc + l.devices.filter(d => d.status === 'Online').length, 0);
    const totalDevs = allZoneLocs.reduce((acc, l) => acc + l.devices.length, 0);

    REGIONAL_OFFICES.push({
      id: zone.code.toLowerCase(),
      name: `${zone.name} Region Office`,
      zoneName: zone.name,
      code: zone.code,
      division: div.name,
      districts: zone.districts,
      branchCount: zoneBranches.length,
      subBranchCount: zoneSubBranches.length,
      islamicCount: zoneIslamic.length,
      totalLocations: allZoneLocs.length,
      deviceCount: totalDevs,
      onlineDeviceCount: onlineDevs,
      status: (onlineDevs / (totalDevs || 1)) > 0.9 ? 'Online' : 'Sync Issue',
      manager: `General Manager / DGM (${zone.name})`,
      phone: `+880 2-2233${Math.floor(1000 + Math.random() * 8999)}`,
      address: `Regional Office Building, ${zone.districts[0]}, Bangladesh`
    });
  }
}

console.log(`Regional Offices generated: ${REGIONAL_OFFICES.length}`);

// Output JS content
const fileContent = `/**
 * Pubali Bank PLC - Complete Nationwide Branch, Sub-branch & Device Network
 * Official count: 519 Branches, 281 Sub-branches (Upashakha), 29 Islamic Banking Units
 * Total: 829 Locations across all 8 Divisions and 64 Districts of Bangladesh
 * Centralized Suprema BioStar 2 Deployment
 */

export const DIVISIONS_LIST = ${JSON.stringify(DIVISIONS.map(d => d.name), null, 2)};

export const REGIONAL_OFFICES = ${JSON.stringify(REGIONAL_OFFICES, null, 2)};

export const FULL_PUBALI_LOCATIONS = ${JSON.stringify(FULL_PUBALI_LOCATIONS, null, 2)};

export const NETWORK_STATISTICS = {
  totalLocations: ${FULL_PUBALI_LOCATIONS.length},
  branchesCount: ${branches.length},
  subBranchesCount: ${subBranches.length},
  islamicUnitsCount: ${islamicUnits.length},
  divisionsCount: ${DIVISIONS.length},
  districtsCount: 64,
  regionalOfficesCount: ${REGIONAL_OFFICES.length},
  totalDevices: ${FULL_PUBALI_LOCATIONS.reduce((a, l) => a + l.devices.length, 0)},
  onlineDevices: ${FULL_PUBALI_LOCATIONS.reduce((a, l) => a + l.devices.filter(d => d.status === 'Online').length, 0)},
  offlineDevices: ${FULL_PUBALI_LOCATIONS.reduce((a, l) => a + l.devices.filter(d => d.status === 'Offline').length, 0)},
  tamperAlerts: 14,
  headOfficeLocationId: 'PB-LOC-0101'
};
`;

const outputPath = path.join(__dirname, '../client/src/data/pubaliFullBranches.js');
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Successfully generated: ${outputPath}`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
