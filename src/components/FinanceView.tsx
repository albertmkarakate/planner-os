import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart as PieChartIcon, 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  BarChart3,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { EmptyState } from './ui/EmptyState';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_DATA_ANNUAL = [
  { month: 'Jan', income: 1200, expenses: 900 },
  { month: 'Feb', income: 1200, expenses: 1100 },
  { month: 'Mar', income: 1200, expenses: 850 },
  { month: 'Apr', income: 1500, expenses: 1300 },
  { month: 'May', income: 1200, expenses: 950 },
  { month: 'Jun', income: 1200, expenses: 1000 },
];

const CATEGORY_DATA = [
  { name: 'Housing', value: 800, color: '#9d81ff' },
  { name: 'Food', value: 300, color: '#4ade80' },
  { name: 'Textbooks', value: 150, color: '#3B82F6' },
  { name: 'Others', value: 200, color: '#f59e0b' },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  // Calculate offset to "explode" the slice
  const midAngle = (startAngle + endAngle) / 2;
  const RADIAN = Math.PI / 180;
  const offset = 8;
  const offsetX = offset * Math.cos(-midAngle * RADIAN);
  const offsetY = offset * Math.sin(-midAngle * RADIAN);

  return (
    <g transform={`translate(${offsetX}, ${offsetY})`}>
      <path
        d={`M ${cx} ${cy} L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN)} A ${outerRadius} ${outerRadius} 0 0 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN)} Z`}
        fill={fill}
        stroke="none"
        style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
      />
      <circle cx={cx} cy={cy} r={innerRadius} fill="transparent" />
    </g>
  );
};

export default function FinanceView() {
  const [activeTab, setActiveTab] = useState<"ledger" | "analytics">("ledger");
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem("planner_finance");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: "Campus Bookstore",
        cat: "Textbooks",
        amount: -64.2,
        date: "2026-04-19",
      },
      {
        id: 2,
        title: "Local Coffee",
        cat: "Food",
        amount: -4.5,
        date: "2026-04-19",
      },
      {
        id: 3,
        title: "Monthly Scholarship",
        cat: "Income",
        amount: 500.0,
        date: "2026-04-18",
      },
      {
        id: 4,
        title: "Student Rent",
        cat: "Housing",
        amount: -800.0,
        date: "2026-04-17",
      },
      {
        id: 5,
        title: "Groceries Store",
        cat: "Food",
        amount: -82.3,
        date: "2026-04-15",
      },
      {
        id: 6,
        title: "Freelance Design",
        cat: "Income",
        amount: 250.0,
        date: "2026-04-14",
      },
    ];
  });

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [transactionForm, setTransactionForm] = useState({
    title: "",
    cat: "Food",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  React.useEffect(() => {
    localStorage.setItem("planner_finance", JSON.stringify(transactions));
  }, [transactions]);

  const openTransactionModal = (t: any = null) => {
    if (t) {
      setEditingTransaction(t);
      setTransactionForm({
        title: t.title,
        cat: t.cat,
        amount: Math.abs(t.amount).toString(),
        date: t.date,
      });
    } else {
      setEditingTransaction(null);
      setTransactionForm({
        title: "",
        cat: "Food",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = () => {
    if (!transactionForm.title.trim() || !transactionForm.amount) return;
    const amountVal = parseFloat(transactionForm.amount);
    const finalAmount = transactionForm.cat === "Income" ? amountVal : -amountVal;

    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id
            ? { ...t, ...transactionForm, amount: finalAmount }
            : t,
        ),
      );
    } else {
      const newT = {
        id: Date.now(),
        ...transactionForm,
        amount: finalAmount,
      };
      setTransactions((prev) => [newT, ...prev]);
    }
    setShowTransactionModal(false);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setShowTransactionModal(false);
  };

  const stats = {
    balance: transactions.reduce((acc, t) => acc + t.amount, 0),
    income: transactions
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0),
    expenses: Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => acc + t.amount, 0),
    ),
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-4xl tracking-tight text-white flex items-center gap-4">
          <Wallet className="text-[#9d81ff]" size={36} />
          Capital Management
        </h2>
        
        <div className="flex bg-white/5 p-1 rounded-[6px] gap-1 border border-white/5">
          {[
            { id: 'ledger', label: 'Financial Ledger', icon: CreditCard },
            { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#9d81ff] text-white shadow-lg' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Current Liquidity', value: stats.balance, icon: Wallet, color: '#9d81ff', trend: '+5.2%' },
          { label: 'Monthly Inflows', value: stats.income, icon: ArrowUpRight, color: '#4ade80', trend: 'Stable' },
          { label: 'Total Outflows', value: stats.expenses, icon: ArrowDownLeft, color: '#ef4444', trend: '-2.4%' },
        ].map((s, i) => (
          <div key={i} className="p-8 glass-card space-y-4 hover:bg-white/5 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-0 group-hover:opacity-[0.02] rotate-45 -mr-16 -mt-16 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 bg-white/5" style={{ color: s.color }}>
                <s.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-white/40">{s.trend}</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{s.label}</p>
              <p className="text-3xl font-bold text-white tracking-tighter">
                ${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'ledger' ? (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="relative flex-1 w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                   <input 
                    type="text" 
                    placeholder="Search by vendor, category or date..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#9d81ff] transition-all"
                   />
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white/60 hover:text-white transition-all">
                      <Filter size={16} /> Filter
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white/60 hover:text-white transition-all">
                      <Download size={16} /> Export
                    </button>
                    <button 
                      onClick={() => openTransactionModal()}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#9d81ff] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#9d81ff]/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Add Entry
                    </button>
                 </div>
              </div>

              {/* Ledger Table */}
              <div className="glass-card overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                     <thead>
                       <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20 text-left bg-white/[0.02]">
                         <th className="px-6 py-4">Transaction Details</th>
                         <th className="px-6 py-4">Classification</th>
                         <th className="px-6 py-4">Value</th>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white/10 transition-colors">
                                  <CreditCard size={18} />
                                </div>
                                <span className="font-bold text-sm text-white">{t.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {t.cat}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`font-black text-sm tracking-tight ${t.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-xs font-mono text-white/30 tracking-tighter uppercase">{t.date}</td>
                            <td className="px-6 py-5">
                               <button 
                                 onClick={() => openTransactionModal(t)}
                                 className="p-2 text-white/20 hover:text-[#9d81ff] transition-colors"
                               >
                                 <MoreHorizontal size={18} />
                               </button>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Expense Distribution */}
               <div className="p-8 glass-card space-y-8 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Expense Allocation</h3>
                    <TrendingUp className="text-[#9d81ff]" size={16} />
                  </div>
                  
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_DATA}
                          cx="50%"
                          cy="50%"
                          label={({ name }) => name}
                          activeIndex={0}
                          activeShape={renderActiveShape}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {CATEGORY_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: 'var(--color-bg-sidebar)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full pt-4">
                     {CATEGORY_DATA.map((c, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                         <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: c.color, color: c.color }} />
                         <div>
                            <p className="text-[10px] font-bold uppercase text-white/30 tracking-tighter">{c.name}</p>
                            <p className="text-sm font-black text-white">${c.value}</p>
                         </div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Periodic Comparison */}
               <div className="p-8 glass-card space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Income vs Consumption</h3>
                    <div className="flex gap-2">
                       <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#4ade80]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" /> In
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9d81ff]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#9d81ff]" /> Out
                       </div>
                    </div>
                  </div>

                  <div className="w-full h-80 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_DATA_ANNUAL}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ background: '#1a1a24', border: 'none', borderRadius: '12px' }}
                        />
                        <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="#9d81ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-4 bg-[#9d81ff]/10 rounded-2xl border border-[#9d81ff]/20">
                     <p className="text-xs text-white/80 leading-relaxed">
                       <b>AI Forecast:</b> At your current burn rate, your savings will grow by 18% over the next quarter. 
                       We suggest setting aside an extra $50 next month for the 'Final Projects' fee.
                     </p>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {showTransactionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-none">
                      {editingTransaction ? "Refactor Entry" : "New Capital Log"}
                    </h3>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mt-1">
                      Financial Registry
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Vendor / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Bookstore"
                    value={transactionForm.title}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#4ade80] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Classification
                    </label>
                    <select
                      value={transactionForm.cat}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          cat: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#4ade80] transition-all appearance-none"
                    >
                      {[
                        "Food",
                        "Textbooks",
                        "Housing",
                        "Income",
                        "Others",
                        "Entertainment",
                        "Transport",
                      ].map((cat) => (
                        <option key={cat} value={cat} className="bg-[#1a1a24]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                      Value ($USD)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={transactionForm.amount}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          amount: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#4ade80] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    Timestamp Node
                  </label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#4ade80] transition-all"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20 flex gap-3">
                {editingTransaction && (
                  <button
                    onClick={() => handleDeleteTransaction(editingTransaction.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex-1"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSaveTransaction}
                  className="p-4 bg-[#4ade80] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#4ade80]/20 hover:scale-[1.02] active:scale-95 transition-all flex-[2]"
                >
                  {editingTransaction ? "Sync Changes" : "Commit Log"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

