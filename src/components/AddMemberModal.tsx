// import { useState } from 'react';
// import { gql, useQuery, useMutation } from '@apollo/client';
// import { X, User, Phone, MapPin, CreditCard, Calendar, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import dayjs from 'dayjs';
// import { GET_MEMBERS, GET_PLANS, LIVE_QUERY_NAMES } from '../graphql/queries';
// import Select from 'react-select';
// const CREATE_MEMBER = gql`
//   mutation CreateMember($input: MemberInput!) {
//     createMember(input: $input) {
//       id
//       fullName
//     }
//   }
// `;

// interface AddMemberModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
//   const { data: plansData } = useQuery(GET_PLANS, { variables: { page: 1, pageSize: 100 } });
//   const plans = plansData?.allPlans?.results ?? [];
//   const [createMember, { loading }] = useMutation(CREATE_MEMBER, {
//     refetchQueries: [{ query: GET_MEMBERS }, ...LIVE_QUERY_NAMES],
//   });
  
//   const [error, setError] = useState('');
//   const today = dayjs().format('YYYY-MM-DD');

//   const [formData, setFormData] = useState({
//     fullName: '',
//     phoneNumber: '',
//     membershipPlanId: '',
//     joinDate: today,
//     fatherName: '',
//     cnic: '',
//     address: '',
//     notes: '',
//   });

//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value;
//     val = val.replace(/[^\d+]/g, '');
//     setFormData({ ...formData, phoneNumber: val.substring(0, 13) });
//   };

//   const validate = () => {
//     if (!formData.phoneNumber.match(/^(\+923\d{9}|03\d{9})$/)) {
//       setError('Invalid Pakistani number. Use +923XXXXXXXXX or 03XXXXXXXXX');
//       return false;
//     }
    
//     if (dayjs(formData.joinDate).isBefore(dayjs(), 'day')) {
//       setError('Past dates are not allowed for registration.');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (!validate()) return;
    
//     try {
//       await createMember({
//         variables: {
//           input: {
//             ...formData,
//             membershipPlanId: formData.membershipPlanId
//           }
//         }
//       });
//       onSuccess();
//       onClose();
//       setFormData({
//         fullName: '',
//         phoneNumber: '',
//         membershipPlanId: '',
//         joinDate: today,
//         fatherName: '',
//         cnic: '',
//         address: '',
//         notes: '',
//       });
//     } catch (err: any) {
//       if (err.message.includes('unique constraint') || err.message.includes('already exists')) {
//         setError('This mobile number already exists in the system.');
//       } else {
//         setError(err.message);
//       }
//     }
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="absolute inset-0 bg-black/80 backdrop-blur-md"
//           />
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0, y: 20 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.9, opacity: 0, y: 20 }}
//             className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
//           >
//             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
//               <div>
//                 <h2 className="text-2xl font-bold text-white flex items-center">
//                   <User className="w-6 h-6 mr-3 text-primary" />
//                   New Registration
//                 </h2>
//                 <p className="text-textMuted text-xs mt-1">Complete the form to onboard a new member</p>
//               </div>
//               <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-textMuted hover:text-white transition-all">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
//               {error && (
//                 <motion.div 
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
//                 >
//                   <X className="w-4 h-4 shrink-0" />
//                   {error}
//                 </motion.div>
//               )}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Full Name *</label>
//                   <div className="relative group">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
//                     <input
//                       required
//                       type="text"
//                       placeholder="e.g. Rafay Anwar"
//                       className="input-field pl-12"
//                       value={formData.fullName}
//                       onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Phone Number *</label>
//                   <div className="relative group">
//                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
//                     <input
//                       required
//                       type="text"
//                       placeholder="+923001234567"
//                       className="input-field pl-12"
//                       value={formData.phoneNumber}
//                       onChange={handlePhoneChange}
//                     />
//                   </div>
//                 </div>

//                 {/* <div className="space-y-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Membership Plan *</label>
//                   <div className="relative group">
//                     <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors z-10" />
//                     <select
//                       required
//                       className="input-field pl-12 appearance-none bg-black/40"
//                       value={formData.membershipPlanId}
//                       onChange={(e) => setFormData({ ...formData, membershipPlanId: e.target.value })}
//                     >
//                       <option value="">Select a tier...</option>
//                       {plans.map((plan: any) => (
//                         <option key={plan.id} value={plan.id} className="bg-surface">
//                           {plan.planName} - Rs.{plan.price.toLocaleString()}
//                         </option>
//                       ))}
//                     </select>
        
//                   </div>
//                 </div> */}
//                 <div className="space-y-2">
//                 <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
//                   Membership Plan *
//                 </label>

//                 <div className="relative group">
//                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted z-10 pointer-events-none" />

//                   <Select
//                     options={plans.map((plan: any) => ({
//                       value: plan.id,
//                       label: `${plan.planName} - Rs.${plan.price.toLocaleString()}`,
//                     }))}

//                     value={
//                       plans
//                         .filter(
//                           (p: any) =>
//                             p.id === formData.membershipPlanId
//                         )
//                         .map((p: any) => ({
//                           value: p.id,
//                           label: `${p.planName} - Rs.${p.price.toLocaleString()}`,
//                         }))[0] || null
//                     }

//                     onChange={(selected: any) =>
//                       setFormData({
//                         ...formData,
//                         membershipPlanId:
//                           selected?.value || '',
//                       })
//                     }

//                     placeholder="Search or select a plan..."

//                     isSearchable

//                     styles={{
//                       control: (
//                         base: any,
//                         state: any
//                       ) => ({
//                         ...base,
//                         backgroundColor: 'rgba(0,0,0,0.4)',
//                         borderColor: state.isFocused
//                           ? '#00FFA3'
//                           : '#333',
//                         minHeight: '52px',
//                         borderRadius: '16px',
//                         boxShadow: 'none',
//                         paddingLeft: '36px',
//                         cursor: 'pointer',
//                       }),

//                       menu: (base: any) => ({
//                         ...base,
//                         backgroundColor: '#111',
//                         borderRadius: '16px',
//                         overflow: 'hidden',
//                         zIndex: 50,
//                       }),

//                       menuList: (base: any) => ({
//                         ...base,
//                         padding: '6px',
//                       }),

//                       option: (
//                         base: any,
//                         state: any
//                       ) => ({
//                         ...base,
//                         backgroundColor: state.isFocused
//                           ? '#1a1a1a'
//                           : '#111',
//                         color: 'white',
//                         borderRadius: '10px',
//                         cursor: 'pointer',
//                         marginBottom: '4px',
//                       }),

//                       singleValue: (base: any) => ({
//                         ...base,
//                         color: 'white',
//                       }),

//                       input: (base: any) => ({
//                         ...base,
//                         color: 'white',
//                       }),

//                       placeholder: (base: any) => ({
//                         ...base,
//                         color: '#888',
//                       }),

//                       dropdownIndicator: (
//                         base: any
//                       ) => ({
//                         ...base,
//                         color: '#888',
//                       }),

//                       indicatorSeparator: () => ({
//                         display: 'none',
//                       }),
//                     }}
//                   />
//                 </div>
//               </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Join Date *</label>
//                   <div className="relative group">
//                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
//                     <input
//                       required
//                       type="date"
//                       min={today}
//                       className="input-field pl-12"
//                       value={formData.joinDate}
//                       onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Father's Name</label>
//                   <input
//                     type="text"
//                     placeholder="Father's full name"
//                     className="input-field"
//                     value={formData.fatherName}
//                     onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">CNIC Number</label>
//                   <input
//                     type="text"
//                     placeholder="42101-XXXXXXX-X"
//                     className="input-field"
//                     value={formData.cnic}
//                     onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2 md:col-span-2">
//                   <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Permanent Address</label>
//                   <div className="relative group">
//                     <MapPin className="absolute left-4 top-4 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
//                     <textarea
//                       placeholder="Home or office address"
//                       className="input-field pl-12 h-24 pt-4 resize-none"
//                       value={formData.address}
//                       onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </form>

//             <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-6 py-2.5 rounded-xl text-sm font-bold text-textMuted hover:text-white transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 disabled={loading}
//                 onClick={handleSubmit}
//                 className="btn-primary flex items-center px-8"
//               >
//                 {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
//                 {loading ? 'Processing...' : 'Complete Registration'}
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }


import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { GET_MEMBERS, GET_PLANS, LIVE_QUERY_NAMES } from '../graphql/queries';
import Select from 'react-select';

const CREATE_MEMBER = gql`
  mutation CreateMember($input: MemberInput!) {
    createMember(input: $input) {
      id
      fullName
    }
  }
`;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  membershipPlanId?: string;
  joinDate?: string;
  fatherName?: string;
  cnic?: string;
  address?: string;
  general?: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const { data: plansData } = useQuery(GET_PLANS, {
    variables: { page: 1, pageSize: 100 },
  });

  const plans = plansData?.allPlans?.results ?? [];

  const [createMember, { loading }] = useMutation(CREATE_MEMBER, {
    refetchQueries: [{ query: GET_MEMBERS }, ...LIVE_QUERY_NAMES],
  });

  const today = dayjs().format('YYYY-MM-DD');

  const initialFormData = {
    fullName: '',
    phoneNumber: '',
    membershipPlanId: '',
    joinDate: today,
    fatherName: '',
    cnic: '',
    address: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState<FormErrors>({});

  // =========================
  // Helpers
  // =========================

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: '',
      general: '',
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Only allow numbers and +
    val = val.replace(/[^\d+]/g, '');

    // + only at start
    if (val.includes('+')) {
      val = '+' + val.replace(/\+/g, '').replace(/^\+/, '');
    }

    setFormData({
      ...formData,
      phoneNumber: val.substring(0, 13),
    });

    clearFieldError('phoneNumber');
  };

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 13) {
      value = value.slice(0, 13);
    }

    // Format XXXXX-XXXXXXX-X
    let formatted = value;

    if (value.length > 5 && value.length <= 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(
        5,
        12
      )}-${value.slice(12, 13)}`;
    }

    setFormData({
      ...formData,
      cnic: formatted,
    });

    clearFieldError('cnic');
  };

  // =========================
  // Validation
  // =========================

  const validate = () => {
    const newErrors: FormErrors = {};

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    // Phone
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (
      !/^(\+923\d{9}|03\d{9})$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber =
        'Use +923XXXXXXXXX or 03XXXXXXXXX';
    }

    // Plan
    if (!formData.membershipPlanId) {
      newErrors.membershipPlanId =
        'Please select membership plan';
    }

    // Join Date
    if (!formData.joinDate) {
      newErrors.joinDate = 'Join date is required';
    } else if (
      dayjs(formData.joinDate).isBefore(dayjs(), 'day')
    ) {
      newErrors.joinDate =
        'Past dates are not allowed';
    }

    // Father Name (OPTIONAL)
    if (
      formData.fatherName &&
      formData.fatherName.trim().length < 3
    ) {
      newErrors.fatherName =
        'Father name must be at least 3 characters';
    }

    // CNIC (OPTIONAL)
    if (
      formData.cnic &&
      !/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)
    ) {
      newErrors.cnic =
        'CNIC format should be XXXXX-XXXXXXX-X';
    }

    // Address (OPTIONAL)
    if (
      formData.address &&
      formData.address.trim().length < 5
    ) {
      newErrors.address =
        'Address is too short';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (
    e?: React.FormEvent
  ) => {
    e?.preventDefault();

    setErrors({});

    // Validate BEFORE request
    const isValid = validate();

    if (!isValid) return;

    try {
      await createMember({
        variables: {
          input: {
            fullName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            membershipPlanId:
              formData.membershipPlanId,
            joinDate: formData.joinDate,

            // Optional fields
            fatherName:
              formData.fatherName.trim() || null,

            cnic:
              formData.cnic.trim() || null,

            address:
              formData.address.trim() || null,

            notes:
              formData.notes.trim() || null,
          },
        },
      });

      onSuccess();
      onClose();

      setFormData(initialFormData);
      setErrors({});
    } catch (err: any) {
      const message =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        'Something went wrong';

      if (
        message.toLowerCase().includes('unique') ||
        message.toLowerCase().includes('already exists')
      ) {
        setErrors({
          phoneNumber:
            'This mobile number already exists',
        });
      } else {
        setErrors({
          general: message,
        });
      }
    }
  };

  const inputErrorClass = (field: keyof FormErrors) =>
    errors[field]
      ? 'border border-red-500 focus:border-red-500'
      : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <User className="w-6 h-6 mr-3 text-primary" />
                  New Registration
                </h2>

                <p className="text-textMuted text-xs mt-1">
                  Complete the form to onboard a new member
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl text-textMuted hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar"
            >
              {errors.general && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Full Name *
                  </label>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />

                    <input
                      required
                      type="text"
                      placeholder="e.g. Rafay Anwar"
                      className={`input-field pl-12 ${inputErrorClass(
                        'fullName'
                      )}`}
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          fullName: e.target.value,
                        });
                        clearFieldError('fullName');
                      }}
                    />
                  </div>

                  {errors.fullName && (
                    <p className="text-red-400 text-xs">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Phone Number *
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />

                    <input
                      required
                      type="text"
                      placeholder="+923001234567"
                      className={`input-field pl-12 ${inputErrorClass(
                        'phoneNumber'
                      )}`}
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                    />
                  </div>

                  {errors.phoneNumber && (
                    <p className="text-red-400 text-xs">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Plan */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Membership Plan *
                  </label>

                  <div className="space-y-2">
                      <div
                        className={`${
                          errors.membershipPlanId ? 'border border-red-500 rounded-2xl' : ''
                        }`}
                      >
                        <Select
                          options={plans.map((plan: any) => ({
                            value: plan.id,
                            label: `${plan.planName} - Rs.${plan.price.toLocaleString()}`,
                          }))}

                          value={
                            plans
                              .filter((p: any) => p.id === formData.membershipPlanId)
                              .map((p: any) => ({
                                value: p.id,
                                label: `${p.planName} - Rs.${p.price.toLocaleString()}`,
                              }))[0] || null
                          }

                          onChange={(selected: any) => {
                            setFormData({
                              ...formData,
                              membershipPlanId: selected?.value || '',
                            });

                            clearFieldError('membershipPlanId');
                          }}

                          placeholder="Search or select a plan..."
                          isSearchable

                          styles={{
                            control: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: 'rgba(0,0,0,0.4)',
                              borderColor: state.isFocused ? '#00FFA3' : '#333',
                              minHeight: '52px',
                              borderRadius: '16px',
                              boxShadow: 'none',
                              cursor: 'pointer',
                            }),

                            menu: (base: any) => ({
                              ...base,
                              backgroundColor: '#111',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              zIndex: 50,
                            }),

                            option: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: state.isFocused ? '#1a1a1a' : '#111',
                              color: 'white',
                              cursor: 'pointer',
                            }),

                            singleValue: (base: any) => ({
                              ...base,
                              color: 'white',
                            }),

                            input: (base: any) => ({
                              ...base,
                              color: 'white',
                            }),

                            placeholder: (base: any) => ({
                              ...base,
                              color: '#888',
                            }),

                            indicatorSeparator: () => ({
                              display: 'none',
                            }),
                          }}
                        />
                      </div>

                    {errors.membershipPlanId && (
                      <p className="text-red-400 text-xs">
                        {errors.membershipPlanId}
                      </p>
                    )}
                  </div>

                  {errors.membershipPlanId && (
                    <p className="text-red-400 text-xs">
                      {errors.membershipPlanId}
                    </p>
                  )}
                </div>

                {/* Join Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Join Date *
                  </label>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />

                    <input
                      required
                      type="date"
                      min={today}
                      className={`input-field pl-12 ${inputErrorClass(
                        'joinDate'
                      )}`}
                      value={formData.joinDate}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          joinDate: e.target.value,
                        });

                        clearFieldError('joinDate');
                      }}
                    />
                  </div>

                  {errors.joinDate && (
                    <p className="text-red-400 text-xs">
                      {errors.joinDate}
                    </p>
                  )}
                </div>

                {/* Father Name OPTIONAL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Father's Name
                  </label>

                  <input
                    type="text"
                    placeholder="Father's full name"
                    className={`input-field ${inputErrorClass(
                      'fatherName'
                    )}`}
                    value={formData.fatherName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        fatherName: e.target.value,
                      });

                      clearFieldError('fatherName');
                    }}
                  />

                  {errors.fatherName && (
                    <p className="text-red-400 text-xs">
                      {errors.fatherName}
                    </p>
                  )}
                </div>

                {/* CNIC OPTIONAL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    CNIC Number
                  </label>

                  <input
                    type="text"
                    placeholder="42101-XXXXXXX-X"
                    className={`input-field ${inputErrorClass(
                      'cnic'
                    )}`}
                    value={formData.cnic}
                    onChange={handleCNICChange}
                  />

                  {errors.cnic && (
                    <p className="text-red-400 text-xs">
                      {errors.cnic}
                    </p>
                  )}
                </div>

                {/* Address OPTIONAL */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-textMuted uppercase tracking-wider">
                    Permanent Address
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-textMuted" />

                    <textarea
                      placeholder="Home or office address"
                      className={`input-field pl-12 h-24 pt-4 resize-none ${inputErrorClass(
                        'address'
                      )}`}
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address: e.target.value,
                        });

                        clearFieldError('address');
                      }}
                    />
                  </div>

                  {errors.address && (
                    <p className="text-red-400 text-xs">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-textMuted hover:text-white transition-all"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={handleSubmit}
                className="btn-primary flex items-center px-8 disabled:opacity-50"
              >
                {loading && (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                )}

                {loading
                  ? 'Processing...'
                  : 'Complete Registration'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}