import { 
  Scholarship, 
  StudentEligibilityProfile, 
  EligibilityEvaluationReport, 
  ConditionResult, 
  EligibilityVerdict,
  Language 
} from '../types';
import { VERIFIED_SCHOLARSHIPS } from '../data/verifiedScholarships';

export class EligibilityEngine {
  /**
   * Evaluate a student against a specific scholarship
   */
  static evaluateScholarship(
    scholarship: Scholarship,
    student: StudentEligibilityProfile,
    lang: Language = 'en'
  ): EligibilityEvaluationReport {
    const conditions: ConditionResult[] = [];
    let satisfiedCount = 0;
    let failedCount = 0;
    let missingCount = 0;

    // 1. Domicile / State Evaluation
    if (scholarship.eligible_states && scholarship.eligible_states.length > 0) {
      const isAllIndia = scholarship.eligible_states.includes('All India');
      const matchesState = isAllIndia || scholarship.eligible_states.includes(student.state);
      
      if (!student.state) {
        missingCount++;
        conditions.push({
          condition_id: 'state_check',
          title: lang === 'te' ? 'రాష్ట్ర నివాస అర్హత' : lang === 'hi' ? 'राज्य निवास पात्रता' : 'State Domicile Condition',
          status: 'missing_info',
          student_value: undefined,
          requirement_description: isAllIndia 
            ? (lang === 'te' ? 'భారతదేశంలోని అన్ని రాష్ట్రాలు' : lang === 'hi' ? 'संपूर्ण भारत' : 'All India Residents')
            : scholarship.eligible_states.join(', '),
          guidance_note: lang === 'te' ? 'దయచేసి మీ నివాస రాష్ట్రాన్ని ఎంచుకోండి' : lang === 'hi' ? 'कृपया अपना निवास राज्य चुनें' : 'Please provide your domicile state',
        });
      } else if (matchesState) {
        satisfiedCount++;
        conditions.push({
          condition_id: 'state_check',
          title: lang === 'te' ? 'రాష్ట్ర నివాస అర్హత' : lang === 'hi' ? 'राज्य निवास पात्रता' : 'State Domicile Condition',
          status: 'satisfied',
          student_value: student.state,
          requirement_description: isAllIndia 
            ? (lang === 'te' ? 'అఖిల భారత అర్హత' : lang === 'hi' ? 'अखिल भारतीय पात्रता' : 'Open to All Indian States')
            : (lang === 'te' ? `${scholarship.eligible_states.join(', ')} నివాసి అయి ఉండాలి` : lang === 'hi' ? `${scholarship.eligible_states.join(', ')} का निवासी` : `Eligible states: ${scholarship.eligible_states.join(', ')}`),
        });
      } else {
        failedCount++;
        conditions.push({
          condition_id: 'state_check',
          title: lang === 'te' ? 'రాష్ట్ర నివాస అర్హత' : lang === 'hi' ? 'राज्य निवास पात्रता' : 'State Domicile Condition',
          status: 'failed',
          student_value: student.state,
          requirement_description: scholarship.eligible_states.join(', '),
          guidance_note: lang === 'te' ? 'ఈ పథకం మీ రాష్ట్రానికి వర్తించదు' : lang === 'hi' ? 'यह योजना आपके राज्य पर लागू नहीं होती' : 'This scheme is specific to other designated states',
        });
      }
    }

    // 2. Education Level Evaluation
    if (scholarship.education_levels && scholarship.education_levels.length > 0) {
      const matchesLevel = scholarship.education_levels.includes(student.education_level);
      if (!student.education_level) {
        missingCount++;
        conditions.push({
          condition_id: 'level_check',
          title: lang === 'te' ? 'విద్యా స్థాయి' : lang === 'hi' ? 'शिक्षा स्तर' : 'Education Level',
          status: 'missing_info',
          student_value: undefined,
          requirement_description: scholarship.education_levels.join(', '),
        });
      } else if (matchesLevel) {
        satisfiedCount++;
        conditions.push({
          condition_id: 'level_check',
          title: lang === 'te' ? 'విద్యా స్థాయి' : lang === 'hi' ? 'शिक्षा स्तर' : 'Education Level',
          status: 'satisfied',
          student_value: student.education_level.replace(/_/g, ' '),
          requirement_description: scholarship.education_levels.map(l => l.replace(/_/g, ' ')).join(', '),
        });
      } else {
        failedCount++;
        conditions.push({
          condition_id: 'level_check',
          title: lang === 'te' ? 'విద్యా స్థాయి' : lang === 'hi' ? 'शिक्षा स्तर' : 'Education Level',
          status: 'failed',
          student_value: student.education_level.replace(/_/g, ' '),
          requirement_description: scholarship.education_levels.map(l => l.replace(/_/g, ' ')).join(', '),
          guidance_note: lang === 'te' ? 'పథకం నిర్దేశిత తరగతులకు మాత్రమే వర్తిస్తుంది' : lang === 'hi' ? 'यह योजना केवल निर्दिष्ट स्तरों के लिए है' : 'Targeted towards different academic levels',
        });
      }
    }

    // 3. Family Income Ceiling Evaluation
    if (scholarship.income_limit !== null && scholarship.income_limit !== undefined) {
      if (student.family_income === undefined || student.family_income === null || isNaN(student.family_income)) {
        missingCount++;
        conditions.push({
          condition_id: 'income_check',
          title: lang === 'te' ? 'కుటుంబ ఆదాయ పరిమితి' : lang === 'hi' ? 'पारिवारिक आय सीमा' : 'Annual Income Ceiling',
          status: 'missing_info',
          student_value: undefined,
          requirement_description: `≤ ₹${scholarship.income_limit.toLocaleString('en-IN')}`,
          guidance_note: lang === 'te' ? 'కుటుంబ ఆదాయ వివరాలు నమోదు చేయండి' : lang === 'hi' ? 'पारिवारिक आय दर्ज करें' : 'Income details required to evaluate',
        });
      } else if (student.family_income <= scholarship.income_limit) {
        satisfiedCount++;
        conditions.push({
          condition_id: 'income_check',
          title: lang === 'te' ? 'కుటుంబ ఆదాయ పరిమితి' : lang === 'hi' ? 'पारिवारिक आय सीमा' : 'Annual Income Ceiling',
          status: 'satisfied',
          student_value: `₹${student.family_income.toLocaleString('en-IN')}`,
          requirement_description: `≤ ₹${scholarship.income_limit.toLocaleString('en-IN')}`,
        });
      } else {
        failedCount++;
        conditions.push({
          condition_id: 'income_check',
          title: lang === 'te' ? 'కుటుంబ ఆదాయ పరిమితి' : lang === 'hi' ? 'पारिवारिक आय सीमा' : 'Annual Income Ceiling',
          status: 'failed',
          student_value: `₹${student.family_income.toLocaleString('en-IN')}`,
          requirement_description: `≤ ₹${scholarship.income_limit.toLocaleString('en-IN')}`,
          guidance_note: lang === 'te' 
            ? `మీ ఆదాయం నిర్దేశిత పరిమితి ₹${scholarship.income_limit.toLocaleString('en-IN')} కంటే ఎక్కువ` 
            : lang === 'hi' 
            ? `आपकी आय सीमा ₹${scholarship.income_limit.toLocaleString('en-IN')} से अधिक है` 
            : `Exceeds official ceiling of ₹${scholarship.income_limit.toLocaleString('en-IN')}`,
        });
      }
    }

    // 4. Social Category Evaluation
    if (scholarship.applicable_categories && scholarship.applicable_categories.length > 0) {
      const isAllCategories = scholarship.applicable_categories.includes('General') && scholarship.applicable_categories.length >= 4;
      const matchesCategory = isAllCategories || scholarship.applicable_categories.includes(student.category);

      if (!student.category) {
        missingCount++;
        conditions.push({
          condition_id: 'category_check',
          title: lang === 'te' ? 'సామాజిక వర్గం (కేటగిరీ)' : lang === 'hi' ? 'सामाजिक वर्ग (श्रेणी)' : 'Social Category',
          status: 'missing_info',
          student_value: undefined,
          requirement_description: scholarship.applicable_categories.join(', '),
        });
      } else if (matchesCategory) {
        satisfiedCount++;
        conditions.push({
          condition_id: 'category_check',
          title: lang === 'te' ? 'సామాజిక వర్గం (కేటగిరీ)' : lang === 'hi' ? 'सामाजिक वर्ग (श्रेणी)' : 'Social Category',
          status: 'satisfied',
          student_value: student.category,
          requirement_description: scholarship.applicable_categories.join(', '),
        });
      } else {
        failedCount++;
        conditions.push({
          condition_id: 'category_check',
          title: lang === 'te' ? 'సామాజిక వర్గం (కేటగిరీ)' : lang === 'hi' ? 'सामाजिक वर्ग (श्रेणी)' : 'Social Category',
          status: 'failed',
          student_value: student.category,
          requirement_description: scholarship.applicable_categories.join(', '),
          guidance_note: lang === 'te' 
            ? `ఈ పథకం ${scholarship.applicable_categories.join(', ')} వర్గాల కొరకు ఉద్దేశించబడింది` 
            : lang === 'hi' 
            ? `यह योजना केवल ${scholarship.applicable_categories.join(', ')} के लिए है` 
            : `Restricted to categories: ${scholarship.applicable_categories.join(', ')}`,
        });
      }
    }

    // 5. Gender Evaluation
    if (scholarship.applicable_genders && !scholarship.applicable_genders.includes('all')) {
      const matchesGender = scholarship.applicable_genders.includes(student.gender as any);
      if (!student.gender) {
        missingCount++;
        conditions.push({
          condition_id: 'gender_check',
          title: lang === 'te' ? 'లింగ నిబంధన' : lang === 'hi' ? 'लिंग आवश्यकता' : 'Gender Requirement',
          status: 'missing_info',
          student_value: undefined,
          requirement_description: scholarship.applicable_genders.join(', '),
        });
      } else if (matchesGender) {
        satisfiedCount++;
        conditions.push({
          condition_id: 'gender_check',
          title: lang === 'te' ? 'లింగ నిబంధన' : lang === 'hi' ? 'लिंग आवश्यकता' : 'Gender Requirement',
          status: 'satisfied',
          student_value: student.gender,
          requirement_description: scholarship.applicable_genders.join(', '),
        });
      } else {
        failedCount++;
        conditions.push({
          condition_id: 'gender_check',
          title: lang === 'te' ? 'లింగ నిబంధన' : lang === 'hi' ? 'लिंग आवश्यकता' : 'Gender Requirement',
          status: 'failed',
          student_value: student.gender,
          requirement_description: scholarship.applicable_genders.join(', '),
          guidance_note: lang === 'te' ? 'ఈ పథకం నిర్దిష్ట లింగానికి మాత్రమే కేటాయించబడింది' : lang === 'hi' ? 'यह योजना केवल निर्दिष्ट लिंग के लिए है' : 'Targeted specifically for designated gender',
        });
      }
    }

    // 6. Minimum Marks Evaluation (if condition exists in scholarship)
    const marksCondition = scholarship.eligibility_conditions.find(c => c.field === 'minimum_marks');
    if (marksCondition) {
      const minRequired = Number(marksCondition.value);
      if (student.previous_marks_percentage === undefined || isNaN(student.previous_marks_percentage)) {
        missingCount++;
        conditions.push({
          condition_id: 'marks_check',
          title: lang === 'te' ? 'కనీస మార్కుల శాతం' : lang === 'hi' ? 'न्यूनतम अंक प्रतिशत' : 'Minimum Academic Marks',
          status: 'missing_info',
          student_value: undefined,
          requirement_description: `≥ ${minRequired}%`,
          guidance_note: lang === 'te' ? 'మార్కుల శాతం నమోదు చేయండి' : lang === 'hi' ? 'अंक प्रतिशत दर्ज करें' : 'Academic percentage needed',
        });
      } else if (student.previous_marks_percentage >= minRequired) {
        satisfiedCount++;
        conditions.push({
          condition_id: 'marks_check',
          title: lang === 'te' ? 'కనీస మార్కుల శాతం' : lang === 'hi' ? 'न्यूनतम अंक प्रतिशत' : 'Minimum Academic Marks',
          status: 'satisfied',
          student_value: `${student.previous_marks_percentage}%`,
          requirement_description: `≥ ${minRequired}%`,
        });
      } else {
        failedCount++;
        conditions.push({
          condition_id: 'marks_check',
          title: lang === 'te' ? 'కనీస మార్కుల శాతం' : lang === 'hi' ? 'न्यूनतम अंक प्रतिशत' : 'Minimum Academic Marks',
          status: 'failed',
          student_value: `${student.previous_marks_percentage}%`,
          requirement_description: `≥ ${minRequired}%`,
          guidance_note: lang === 'te' ? 'మార్కులు నిర్దేశిత కట్-ఆఫ్ కంటే తక్కువగా ఉన్నాయి' : lang === 'hi' ? 'अंक आवश्यक कट-ऑफ से कम हैं' : 'Below required academic cutoff',
        });
      }
    }

    // Determine Overall Verdict
    let verdict: EligibilityVerdict = 'cannot_determine';
    if (failedCount > 0) {
      verdict = 'not_eligible';
    } else if (missingCount > 0 && satisfiedCount > 0) {
      verdict = 'potentially_eligible';
    } else if (missingCount > 0 && satisfiedCount === 0) {
      verdict = 'cannot_determine';
    } else if (failedCount === 0 && satisfiedCount > 0) {
      verdict = 'appears_eligible';
    }

    let summary = '';
    if (verdict === 'appears_eligible') {
      summary = lang === 'te' 
        ? `అభినందనలు! అందుబాటులో ఉన్న సమాచారం ప్రకారం మీరు ఈ పథకానికి అర్హత ప్రమాణాలను పూర్తి చేస్తున్నారు.`
        : lang === 'hi'
        ? `बधाई हो! उपलब्ध जानकारी के अनुसार आप इस योजना के सभी प्रकाशित पात्रता मानदंडों को पूरा करते हैं।`
        : `Based on your provided profile, you meet all published statutory eligibility criteria.`;
    } else if (verdict === 'potentially_eligible') {
      summary = lang === 'te'
        ? `మీరు కొన్ని అర్హతలను పూర్తి చేశారు, అయితే కచ్చితమైన అంచనా కోసం మరికొన్ని వివరాలు అవసరం.`
        : lang === 'hi'
        ? `आप कुछ शर्तों को पूरा करते हैं, लेकिन पुष्टिकरण के लिए अतिरिक्त जानकारी आवश्यक है।`
        : `You satisfy primary conditions, but additional scheme-specific inputs are needed.`;
    } else if (verdict === 'not_eligible') {
      summary = lang === 'te'
        ? `అందుబాటులో ఉన్న నిబంధనల ప్రకారం మీరు ఈ పథకానికి అర్హులుగా కనిపించడం లేదు.`
        : lang === 'hi'
        ? `उपलब्ध आधिकारिक नियमों के अनुसार आप इस योजना के लिए पात्र प्रतीत नहीं होते हैं।`
        : `You do not appear to meet one or more mandatory eligibility requirements.`;
    } else {
      summary = lang === 'te'
        ? `అర్హతను నిర్ణయించడానికి మరింత సమాచారం అవసరం.`
        : lang === 'hi'
        ? `पात्रता निर्धारित करने के लिए अधिक जानकारी आवश्यक है।`
        : `Please fill in all mandatory profile fields to calculate eligibility.`;
    }

    const disclaimer = lang === 'te'
      ? 'గమనిక: ఇది ప్రచురించబడిన నిబంధనల ఆధారంగా స్వయంచాలక ముందస్తు అంచనా మాత్రమే. తుది మంజూరు నిర్ణయం అధికారిక స్కాలర్‌షిప్ కమిటీదే.'
      : lang === 'hi'
      ? 'नोट: यह आधिकारिक नियमों पर आधारित एक स्वचालित प्रारंभिक मूल्यांकन है। अंतिम स्वीकृति का निर्णय केवल संबंधित प्राधिकारी का होगा।'
      : 'Note: This is an automated assessment based on published guidelines. The final decision rests solely with the competent sanctioning authority.';

    return {
      scholarship_id: scholarship.id,
      scholarship_title: scholarship.title[lang] || scholarship.title.en,
      verdict,
      satisfied_count: satisfiedCount,
      failed_count: failedCount,
      missing_count: missingCount,
      conditions,
      summary,
      disclaimer,
    };
  }

  /**
   * Evaluate student against all verified scholarships and return ranked matches
   */
  static evaluateAllScholarships(
    student: StudentEligibilityProfile,
    lang: Language = 'en',
    scholarshipsList: Scholarship[] = VERIFIED_SCHOLARSHIPS
  ): {
    eligible: { scholarship: Scholarship; report: EligibilityEvaluationReport }[];
    potential: { scholarship: Scholarship; report: EligibilityEvaluationReport }[];
    ineligible: { scholarship: Scholarship; report: EligibilityEvaluationReport }[];
  } {
    const eligible: { scholarship: Scholarship; report: EligibilityEvaluationReport }[] = [];
    const potential: { scholarship: Scholarship; report: EligibilityEvaluationReport }[] = [];
    const ineligible: { scholarship: Scholarship; report: EligibilityEvaluationReport }[] = [];

    const list = scholarshipsList && scholarshipsList.length > 0 ? scholarshipsList : VERIFIED_SCHOLARSHIPS;

    list.forEach((s) => {
      const report = this.evaluateScholarship(s, student, lang);
      if (report.verdict === 'appears_eligible') {
        eligible.push({ scholarship: s, report });
      } else if (report.verdict === 'potentially_eligible') {
        potential.push({ scholarship: s, report });
      } else {
        ineligible.push({ scholarship: s, report });
      }
    });

    return { eligible, potential, ineligible };
  }
}
