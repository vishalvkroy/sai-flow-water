// Comprehensive Indian States and Union Territories Data
const INDIAN_STATES = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'UT' },
  { code: 'AP', name: 'Andhra Pradesh', type: 'State' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'State' },
  { code: 'AS', name: 'Assam', type: 'State' },
  { code: 'BR', name: 'Bihar', type: 'State' },
  { code: 'CH', name: 'Chandigarh', type: 'UT' },
  { code: 'CT', name: 'Chhattisgarh', type: 'State' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UT' },
  { code: 'DL', name: 'Delhi', type: 'UT' },
  { code: 'GA', name: 'Goa', type: 'State' },
  { code: 'GJ', name: 'Gujarat', type: 'State' },
  { code: 'HR', name: 'Haryana', type: 'State' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'State' },
  { code: 'JK', name: 'Jammu and Kashmir', type: 'UT' },
  { code: 'JH', name: 'Jharkhand', type: 'State' },
  { code: 'KA', name: 'Karnataka', type: 'State' },
  { code: 'KL', name: 'Kerala', type: 'State' },
  { code: 'LA', name: 'Ladakh', type: 'UT' },
  { code: 'LD', name: 'Lakshadweep', type: 'UT' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'State' },
  { code: 'MH', name: 'Maharashtra', type: 'State' },
  { code: 'MN', name: 'Manipur', type: 'State' },
  { code: 'ML', name: 'Meghalaya', type: 'State' },
  { code: 'MZ', name: 'Mizoram', type: 'State' },
  { code: 'NL', name: 'Nagaland', type: 'State' },
  { code: 'OR', name: 'Odisha', type: 'State' },
  { code: 'PY', name: 'Puducherry', type: 'UT' },
  { code: 'PB', name: 'Punjab', type: 'State' },
  { code: 'RJ', name: 'Rajasthan', type: 'State' },
  { code: 'SK', name: 'Sikkim', type: 'State' },
  { code: 'TN', name: 'Tamil Nadu', type: 'State' },
  { code: 'TG', name: 'Telangana', type: 'State' },
  { code: 'TR', name: 'Tripura', type: 'State' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'State' },
  { code: 'UT', name: 'Uttarakhand', type: 'State' },
  { code: 'WB', name: 'West Bengal', type: 'State' }
];

// Major cities by state (top cities for each state)
const MAJOR_CITIES_BY_STATE = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Kakinada'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Seppa'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Dhubri'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Hajipur', 'Sasaram', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad'],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Dhamtari'],
  'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Karol Bagh', 'Connaught Place', 'Saket', 'Lajpat Nagar'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch', 'Vapi', 'Navsari', 'Veraval', 'Porbandar', 'Godhra', 'Bhuj', 'Gandhidham'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba', 'Kangra'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda'],
  'Karnataka': ['Bangalore', 'Bengaluru', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi', 'Robertsonpet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur', 'Gangavati', 'Bagalkot', 'Ranebennuru'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kottayam', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Hoshangabad', 'Itarsi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Ichalkaranji', 'Parbhani', 'Panvel', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Satara', 'Wardha', 'Udgir', 'Aurangabad', 'Amalner', 'Jalgaon', 'Gondia'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching'],
  'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Sunam'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Tonk', 'Beawar', 'Hanumangarh', 'Jhunjhunu', 'Barmer', 'Chittorgarh', 'Churu'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam', 'Viluppuram', 'Tiruchengode', 'Vaniyambadi', 'Theni', 'Arakkonam', 'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 'Tirupur', 'Avadi', 'Pallavaram', 'Ambattur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Bodhan', 'Palwancha', 'Mandamarri', 'Koratla', 'Sircilla'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Maunath Bhanjan', 'Hapur', 'Ayodhya', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Ujhani', 'Ghazipur', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Greater Noida', 'Shikohabad', 'Shamli', 'Awagarh', 'Kasganj'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh', 'Ramnagar', 'Nainital', 'Kotdwar', 'Mussoorie', 'Tehri', 'Pauri', 'Almora', 'Ranikhet'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Barddhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bangaon', 'Cooch Behar']
};

// Validate Indian PIN code
const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Get state from PIN code (first digit indicates region)
const getStateFromPincode = (pincode) => {
  if (!validatePincode(pincode)) return null;
  
  const firstDigit = pincode.charAt(0);
  const pincodeMap = {
    '1': ['Delhi', 'Haryana', 'Punjab', 'Himachal Pradesh', 'Jammu and Kashmir', 'Chandigarh'],
    '2': ['Uttar Pradesh', 'Uttarakhand'],
    '3': ['Rajasthan', 'Gujarat'],
    '4': ['Maharashtra', 'Goa'],
    '5': ['Andhra Pradesh', 'Karnataka', 'Telangana'],
    '6': ['Tamil Nadu', 'Kerala', 'Puducherry'],
    '7': ['West Bengal', 'Odisha', 'Assam', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya'],
    '8': ['Bihar', 'Jharkhand'],
    '9': ['Madhya Pradesh', 'Chhattisgarh']
  };
  
  return pincodeMap[firstDigit] || [];
};

module.exports = {
  INDIAN_STATES,
  MAJOR_CITIES_BY_STATE,
  validatePincode,
  getStateFromPincode
};
