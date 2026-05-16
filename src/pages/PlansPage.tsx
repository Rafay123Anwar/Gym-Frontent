import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { GET_PLANS } from '../graphql/queries';
import { useModalStore } from '../store/modalStore';

const CREATE_PLAN = gql`
  mutation CreatePlan($input: MembershipPlanInput!) {
    createMembershipPlan(input: $input) {
      id
      planName
    }
  }
`;

const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: UUID!, $input: MembershipPlanInput!) {
    updateMembershipPlan(planId: $id, input: $input) {
      id
      planName
    }
  }
`;

const DELETE_PLAN = gql`
  mutation DeletePlan($id: UUID!) {
    deleteMembershipPlan(planId: $id)
  }
`;

interface MembershipPlan {
  id: string;
  planName: string;
  price: number;
  durationMonths: number;
  description: string | null;
  isActive: boolean;
}

export default function PlansPage() {
  const { showConfirm, showAlert } = useModalStore();
  const { data, loading, refetch } = useQuery(GET_PLANS, {
    variables: { page: 1, pageSize: 100 },
    fetchPolicy: 'cache-and-network',
  });
  const plans = data?.allPlans?.results ?? [];
  const [createPlan] = useMutation(CREATE_PLAN);
  const [updatePlan] = useMutation(UPDATE_PLAN);
  const [deletePlan] = useMutation(DELETE_PLAN);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState({
    planName: '',
    price: 0,
    durationMonths: 1,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updatePlan({ variables: { id: editingPlan.id, input: formData } });
      } else {
        await createPlan({ variables: { input: formData } });
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      setFormData({ planName: '', price: 0, durationMonths: 1, description: '' });
      refetch();
    } catch (err) {
      showAlert({ title: 'Error', message: err instanceof Error ? err.message : 'Error saving plan', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      title: 'Delete Plan',
      message: 'Are you sure you want to delete this plan? This may affect members assigned to it.',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        try {
          await deletePlan({ variables: { id } });
          refetch();
          showAlert({ title: 'Success', message: 'Plan deleted successfully', type: 'success' });
        } catch {
          showAlert({ title: 'Error', message: 'Cannot delete plan: It may be assigned to members.', type: 'error' });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-textMain tracking-tight">Membership Tiers</h1>
          <p className="text-sm text-textMuted font-bold uppercase tracking-widest mt-1">Configure your subscription models</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setFormData({ planName: '', price: 0, durationMonths: 1, description: '' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="glass-panel p-12 text-center text-textMuted col-span-full">
            <p className="font-black text-textMain mb-1">No plans available</p>
            <p className="text-sm">Create your first membership plan</p>
          </div>
        ) : plans.map((plan: MembershipPlan) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={plan.id}
            className="glass-panel p-8 relative group overflow-hidden border-t-4 border-primary shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-textMain tracking-tight">{plan.planName}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setFormData({
                      planName: plan.planName,
                      price: plan.price,
                      durationMonths: plan.durationMonths,
                      description: plan.description || ''
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-3 text-textMuted hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-3 text-textMuted hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all border border-transparent hover:border-red-400/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-black text-textMain tracking-tighter">Rs.{plan.price.toLocaleString()}</span>
              <span className="text-textMuted text-[10px] font-black uppercase tracking-widest">/ {plan.durationMonths} MO</span>
            </div>

            <p className="text-textMuted text-sm mb-8 min-h-[48px] font-medium leading-relaxed italic opacity-80">
              {plan.description || 'Professional subscription tier for elite members.'}
            </p>

            <div className="flex items-center text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full w-fit">
              <Check className="w-3 h-3 mr-1" />
              Active Tier
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-borderLine"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-textMain tracking-tight">
                    {editingPlan ? 'Edit Plan' : 'New Plan'}
                  </h2>
                  <p className="text-[10px] text-textMuted font-black uppercase tracking-widest mt-1">Tier Configuration</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-textMuted hover:text-textMain transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Plan Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Monthly Gold"
                    value={formData.planName}
                    onChange={e => setFormData({ ...formData, planName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Duration (Mo)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-field"
                      value={formData.durationMonths}
                      onChange={e => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Description</label>
                  <textarea
                    className="input-field h-24"
                    placeholder="Tier details..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
