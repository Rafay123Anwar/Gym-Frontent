import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Globe,
  Bell,
  Check,
  Loader2,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '../store/modalStore';

const GET_SETTINGS = gql`
  query GetSettings {
    gymSettings {
      gymName
      address
      contactNumber
      whatsappNumber
      currency
      taxPercentage
      paymentReminders
      membershipExpiryAlerts
      darkMode
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($input: GymSettingsInput!) {
    updateGymSettings(input: $input) {
      gymName
      currency
    }
  }
`;

interface GymSettings {
  gymName: string;
  address: string;
  contactNumber: string;
  whatsappNumber: string;
  currency: string;
  taxPercentage: number;
  paymentReminders: boolean;
  membershipExpiryAlerts: boolean;
  darkMode: boolean;
  __typename?: string;
}

export default function SettingsPage() {
  const { showAlert } = useModalStore();
  const [activeTab, setActiveTab] = useState('branding');
  const { loading, refetch } = useQuery(GET_SETTINGS, {
    onCompleted: (data) => {
      if (data?.gymSettings) {
        setFormData(data.gymSettings);
      }
    }
  });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SETTINGS);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<GymSettings>>({});


  const handleSave = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __typename, ...inputData } = formData;
      await updateSettings({
        variables: { input: inputData }
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      refetch();
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to save settings. Please try again.', type: 'error' });
    }
  };

  const tabs = [
    { id: 'branding', label: 'Gym Branding', icon: Palette },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'notifications', label: 'System Alerts', icon: Bell },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-textMain tracking-tight">System Configuration</h1>
          <p className="text-sm text-textMuted font-bold uppercase tracking-widest mt-1">Manage global gym parameters</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-bold">Settings Saved</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center px-6 lg:px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                  : 'text-textMuted hover:text-textMain hover:bg-secondary'
                }`}
            >
              <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 sm:p-8 shadow-2xl border-borderLine"
          >
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-textMain mb-8 tracking-tight">Branding & Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Gym Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.gymName || ''}
                      onChange={e => setFormData({ ...formData, gymName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Contact Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.contactNumber || ''}
                      onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">WhatsApp Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.whatsappNumber || ''}
                      onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Gym Address</label>
                    <textarea
                      className="input-field h-24 resize-none"
                      value={formData.address || ''}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'localization' && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-textMain mb-8 tracking-tight">Localization & Financials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">System Currency</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Rs. or $"
                      value={formData.currency || ''}
                      onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Tax Percentage (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.taxPercentage || 0}
                      onChange={e => setFormData({ ...formData, taxPercentage: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <h3 className="text-xl font-black text-textMain mb-8 tracking-tight">Automation & Alerts</h3>

                <div className="flex items-center justify-between p-5 bg-secondary rounded-2xl border border-borderLine">
                  <div>
                    <h4 className="text-textMain font-black text-sm tracking-tight">Payment Reminders</h4>
                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">Automated WhatsApp dues alerts</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, paymentReminders: !formData.paymentReminders })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.paymentReminders ? 'bg-primary' : 'bg-surface border border-borderLine'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${formData.paymentReminders ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 bg-secondary rounded-2xl border border-borderLine">
                  <div>
                    <h4 className="text-textMain font-black text-sm tracking-tight">Expiry Alerts</h4>
                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">Staff notifications for near expiry</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, membershipExpiryAlerts: !formData.membershipExpiryAlerts })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.membershipExpiryAlerts ? 'bg-primary' : 'bg-surface border border-borderLine'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${formData.membershipExpiryAlerts ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-borderLine flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center px-10"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                  <span className="font-black uppercase tracking-widest text-xs">{saving ? 'Applying...' : 'Save Configuration'}</span>
                </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
