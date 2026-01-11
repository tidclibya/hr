// حالات النموذج
let currentStep = 1;
const totalSteps = 6;
let formData = {};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين التواريخ الافتراضية
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('birthDate').max = today;
    document.getElementById('appointmentDate').max = today;
    document.getElementById('startDate').max = today;
    
    // تعيين الحد الأدنى لعام المؤهل
    document.getElementById('qualificationYear').min = 1950;
    document.getElementById('qualificationYear').max = new Date().getFullYear();
    
    // التحقق من صحة الرقم الوطني عند الكتابة
    document.getElementById('nationalId').addEventListener('input', validateNationalId);
    
    // التحكم في ظهور/اختفاء حقل عدد الأبناء
    document.getElementById('maritalStatus').addEventListener('change', toggleChildrenField);
    
    // التحكم في التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // التحكم في أنواع التوظيف
    document.querySelectorAll('input[name="employmentStatus"]').forEach(radio => {
        radio.addEventListener('change', changeEmploymentForm);
    });
    
    // أزرار التنقل
    document.getElementById('prevBtn').addEventListener('click', goToPrevStep);
    document.getElementById('nextBtn').addEventListener('click', goToNextStep);
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    
    // أزرار المراجعة
    document.getElementById('backToStep5').addEventListener('click', () => goToStep(5));
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const step = this.getAttribute('data-section').replace('step', '');
            goToStep(parseInt(step));
        });
    });
    
    // أزرار رسالة النجاح
    document.getElementById('addAnotherBtn').addEventListener('click', resetForm);
    document.getElementById('goToListBtn').addEventListener('click', goToList);
    
    // إرسال النموذج
    document.getElementById('employeeForm').addEventListener('submit', submitForm);
    
    // تحميل البيانات من ملف Excel (محاكاة)
    loadSampleData();
});

// التحقق من صحة الرقم الوطني
function validateNationalId() {
    const nationalIdInput = document.getElementById('nationalId');
    const validationMsg = document.getElementById('nationalIdValidation');
    const nationalId = nationalIdInput.value.trim();
    
    if (nationalId.length === 0) {
        validationMsg.textContent = '';
        validationMsg.className = 'validation-message';
        return false;
    }
    
    if (!/^\d{12}$/.test(nationalId)) {
        validationMsg.textContent = 'الرقم الوطني يجب أن يتكون من 12 رقمًا';
        validationMsg.className = 'validation-message error';
        return false;
    }
    
    // التحقق من أن الرقم ليس مكررًا (محاكاة)
    const isDuplicate = checkDuplicateNationalId(nationalId);
    
    if (isDuplicate) {
        validationMsg.textContent = 'الرقم الوطني مسجل مسبقًا في النظام';
        validationMsg.className = 'validation-message error';
        return false;
    }
    
    validationMsg.textContent = '✓ الرقم الوطني صالح';
    validationMsg.className = 'validation-message valid';
    return true;
}

// التحقق من تكرار الرقم الوطني (محاكاة)
function checkDuplicateNationalId(nationalId) {
    // في التطبيق الحقيقي، سيتم التحقق من قاعدة البيانات
    // هنا نستخدم بيانات وهمية للاختبار
    const existingIds = [
        '119760172507', '119710347603', '119970507863',
        '119720006879', '119740316556', '219760251577'
    ];
    
    return existingIds.includes(nationalId);
}

// التحكم في ظهور حقل عدد الأبناء
function toggleChildrenField() {
    const maritalStatus = document.getElementById('maritalStatus').value;
    const childrenField = document.getElementById('childrenField');
    const childrenCount = document.getElementById('childrenCount');
    
    if (maritalStatus === 'متزوج' || maritalStatus === 'متزوجة') {
        childrenField.style.display = 'block';
        childrenCount.required = true;
    } else {
        childrenField.style.display = 'none';
        childrenCount.required = false;
        childrenCount.value = '';
    }
}

// تبديل التبويبات
function switchTab(e) {
    const tabId = e.target.getAttribute('data-tab');
    
    // إزالة النشاط من جميع أزرار التبويب
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إضافة النشاط للزر المحدد
    e.target.classList.add('active');
    
    // إخفاء جميع محتويات التبويبات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إظهار محتوى التبويب المحدد
    document.getElementById(`${tabId}Tab`).classList.add('active');
}

// تغيير نموذج التوظيف
function changeEmploymentForm() {
    const employmentStatus = document.querySelector('input[name="employmentStatus"]:checked').value;
    
    // إخفاء جميع النماذج
    document.querySelectorAll('.employment-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // إظهار النموذج المحدد
    let formId;
    switch(employmentStatus) {
        case 'تعيين':
            formId = 'appointmentForm';
            break;
        case 'عقد':
            formId = 'contractForm';
            break;
        case 'ندب':
            formId = 'delegationForm';
            break;
        case 'إعارة':
            formId = 'secondmentForm';
            break;
    }
    
    document.getElementById(formId).classList.add('active');
    
    // تحديث البيانات في قسم المراجعة
    updateReviewData();
}

// التنقل للخطوة السابقة
function goToPrevStep() {
    if (currentStep > 1) {
        saveStepData(currentStep);
        goToStep(currentStep - 1);
    }
}

// التنقل للخطوة التالية
function goToNextStep() {
    if (validateStep(currentStep)) {
        saveStepData(currentStep);
        
        if (currentStep < totalSteps) {
            goToStep(currentStep + 1);
        } else {
            // إذا كانت الخطوة الأخيرة، انتقل إلى قسم المراجعة
            updateReviewData();
        }
    }
}

// الانتقال لخطوة محددة
function goToStep(step) {
    // تحديث مؤشر التقدم
    updateStepper(step);
    
    // إخفاء الخطوة الحالية
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    // إظهار الخطوة المطلوبة
    document.getElementById(`step${step}`).classList.add('active');
    
    // تحديث حالة أزرار التنقل
    updateNavigationButtons(step);
    
    // تحديث الخطوة الحالية
    currentStep = step;
    
    // التركيز على أول حقل في الخطوة
    focusFirstField(step);
}

// تحديث مؤشر التقدم
function updateStepper(step) {
    document.querySelectorAll('.step').forEach((stepElement, index) => {
        const stepNum = index + 1;
        
        if (stepNum < step) {
            stepElement.classList.add('completed');
            stepElement.classList.remove('active');
        } else if (stepNum === step) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else {
            stepElement.classList.remove('active', 'completed');
        }
    });
}

// تحديث أزرار التنقل
function updateNavigationButtons(step) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    
    if (step === 1) {
        prevBtn.disabled = true;
        nextBtn.textContent = 'التالي';
        saveDraftBtn.style.display = 'inline-flex';
    } else if (step === totalSteps) {
        prevBtn.disabled = false;
        nextBtn.style.display = 'none';
        saveDraftBtn.style.display = 'none';
    } else {
        prevBtn.disabled = false;
        nextBtn.style.display = 'inline-flex';
        nextBtn.textContent = 'التالي';
        saveDraftBtn.style.display = 'inline-flex';
    }
}

// حفظ بيانات الخطوة
function saveStepData(step) {
    const stepElement = document.getElementById(`step${step}`);
    const inputs = stepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name) {
            if (input.type === 'file') {
                // معالجة الملفات
                if (input.files.length > 0) {
                    formData[input.name] = input.files[0].name;
                }
            } else if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        }
    });
    
    console.log(`بيانات الخطوة ${step} محفوظة:`, formData);
}

// التحقق من صحة بيانات الخطوة
function validateStep(step) {
    let isValid = true;
    const stepElement = document.getElementById(`step${step}`);
    const requiredInputs = stepElement.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            markFieldAsInvalid(input, 'هذا الحقل مطلوب');
            isValid = false;
        } else if (input.id === 'nationalId' && !validateNationalId()) {
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            markFieldAsInvalid(input, 'البريد الإلكتروني غير صالح');
            isValid = false;
        } else if (input.id === 'phoneNumber' && !isValidPhoneNumber(input.value)) {
            markFieldAsInvalid(input, 'رقم الهاتف غير صالح');
            isValid = false;
        } else {
            markFieldAsValid(input);
        }
    });
    
    return isValid;
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// التحقق من صحة رقم الهاتف
function isValidPhoneNumber(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

// تمييز الحقل غير الصالح
function markFieldAsInvalid(input, message) {
    input.style.borderColor = '#e53935';
    input.style.boxShadow = '0 0 0 2px rgba(229, 57, 53, 0.2)';
    
    // إظهار رسالة الخطأ
    let errorMsg = input.parentNode.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.style.color = '#e53935';
        errorMsg.style.fontSize = '14px';
        errorMsg.style.marginTop = '5px';
        input.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

// تمييز الحقل الصالح
function markFieldAsValid(input) {
    input.style.borderColor = '#4CAF50';
    input.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
    
    // إزالة رسالة الخطأ
    const errorMsg = input.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// حفظ مؤقت
function saveDraft() {
    saveStepData(currentStep);
    
    // في التطبيق الحقيقي، سيتم حفظ البيانات في قاعدة بيانات أو localStorage
    localStorage.setItem('employeeFormDraft', JSON.stringify(formData));
    
    // عرض رسالة تأكيد
    alert('تم حفظ البيانات مؤقتًا. يمكنك استكمالها لاحقًا.');
    
    console.log('بيانات النموذج المحفوظة مؤقتًا:', formData);
}

// تحديث بيانات المراجعة
function updateReviewData() {
    // البيانات الشخصية
    document.getElementById('reviewFullNameAr').textContent = 
        formData.fullNameAr || 'غير محدد';
    document.getElementById('reviewNationalId').textContent = 
        formData.nationalId || 'غير محدد';
    document.getElementById('reviewGender').textContent = 
        formData.gender || 'غير محدد';
    document.getElementById('reviewBirthDate').textContent = 
        formData.birthDate || 'غير محدد';
    document.getElementById('reviewMaritalStatus').textContent = 
        formData.maritalStatus || 'غير محدد';
    
    // البيانات المصرفية
    document.getElementById('reviewBankName').textContent = 
        formData.bankName || 'غير محدد';
    document.getElementById('reviewBankBranch').textContent = 
        formData.bankBranch || 'غير محدد';
    document.getElementById('reviewAccountNumber').textContent = 
        formData.accountNumber || 'غير محدد';
    document.getElementById('reviewOfficeDepartment').textContent = 
        formData.officeDepartment || 'غير محدد';
    
    // البيانات الوظيفية
    document.getElementById('reviewEmploymentStatus').textContent = 
        formData.employmentStatus || 'غير محدد';
    document.getElementById('reviewEmployeeNumber').textContent = 
        formData.employeeNumber || 'غير محدد';
    document.getElementById('reviewAppointmentDate').textContent = 
        formData.appointmentDate || 'غير محدد';
    document.getElementById('reviewCurrentGrade').textContent = 
        formData.currentGrade || 'غير محدد';
}

// إرسال النموذج
function submitForm(e) {
    e.preventDefault();
    
    // التحقق من تأكيد البيانات
    const confirmationCheckbox = document.getElementById('dataConfirmation');
    if (!confirmationCheckbox.checked) {
        alert('يجب الموافقة على تأكيد صحة البيانات قبل الحفظ النهائي');
        return;
    }
    
    // التحقق من صحة جميع البيانات
    if (validateStep(6)) {
        saveStepData(6);
        
        // في التطبيق الحقيقي، سيتم إرسال البيانات إلى الخادم
        console.log('بيانات النموذج النهائية:', formData);
        
        // عرض رسالة النجاح
        document.getElementById('successMessage').style.display = 'flex';
        
        // مسح البيانات المحفوظة مؤقتًا
        localStorage.removeItem('employeeFormDraft');
    }
}

// إعادة تعيين النموذج
function resetForm() {
    // إخفاء رسالة النجاح
    document.getElementById('successMessage').style.display = 'none';
    
    // إعادة تعيين النموذج
    document.getElementById('employeeForm').reset();
    
    // إعادة تعيين البيانات
    formData = {};
    
    // العودة للخطوة الأولى
    goToStep(1);
    
    // إعادة تعيين مؤشر التقدم
    updateStepper(1);
    
    // التركيز على الرقم الوطني
    document.getElementById('nationalId').focus();
}

// الانتقال للقائمة (محاكاة)
function goToList() {
    alert('سيتم توجيهك إلى قائمة الموظفين في النسخة الكاملة من النظام');
    // في التطبيق الحقيقي: window.location.href = 'employees-list.html';
}

// تحميل بيانات نموذجية للاختبار
function loadSampleData() {
    // محاكاة تحميل البيانات من ملف Excel
    // في التطبيق الحقيقي، سيتم استيراد البيانات من ملف Excel
    console.log('بيانات الموظفين من ملف Excel جاهزة للاستيراد');
    
    // تعيين بيانات افتراضية للاختبار
    setTimeout(() => {
        document.getElementById('nationalId').value = '120010000001';
        document.getElementById('fullNameAr').value = 'أحمد محمد علي';
        document.getElementById('fullNameEn').value = 'Ahmed Mohamed Ali';
        document.getElementById('gender').value = 'ذكر';
        document.getElementById('nationality').value = 'ليبي';
        document.getElementById('birthDate').value = '1990-01-15';
        document.getElementById('birthPlace').value = 'طرابلس';
        
        validateNationalId();
    }, 500);
}

// التركيز على أول حقل في الخطوة
function focusFirstField(step) {
    const stepElement = document.getElementById(`step${step}`);
    const firstInput = stepElement.querySelector('input, select, textarea');
    
    if (firstInput && step !== 6) { // لا نركز في خطوة المراجعة
        firstInput.focus();
    }
}