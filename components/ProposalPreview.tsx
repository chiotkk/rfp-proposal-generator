import React from 'react';
import { BUILDING_BLOCKS } from '../constants';
import { ProposalState, RFPAnalysis } from '../types';
import { FileDown, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';

interface ProposalPreviewProps {
  state: ProposalState;
  analysis: RFPAnalysis;
  onBack: () => void;
  logo: string | null;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({ state, analysis, onBack, logo }) => {
  
  // Helper to calculate totals
  const getTotals = () => {
    const baseTotal = state.pricingItems
        .filter(i => !i.isOptional)
        .reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
    const withOptionals = state.pricingItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
    return { baseTotal, withOptionals };
  };

  const sectionsOrder = [
    { key: 'intro', id: state.introBlockId },
    { key: 'team', id: state.teamBlockId },
    { key: 'case_studies', id: state.caseStudiesBlockIds }, // Array
    { key: 'scope', id: state.scopeBlockId },
    { key: 'timeline', id: state.timelineBlockId },
    { key: 'qa', id: state.qaBlockId },
    { key: 'security', id: state.securityBlockId },
    { key: 'change_mgmt', id: state.changeMgmtBlockId },
    { key: 'training', id: state.trainingBlockId },
    { key: 'deliverables', id: state.deliverablesBlockId },
    { key: 'pricing', id: state.pricingItems }, // Custom Object/Array
    { key: 'terms', id: state.termsBlockId },
  ];

  // --- EXPORT LOGIC ---
  const generateHtmlForExport = () => {
      const { baseTotal, withOptionals } = getTotals();
      
      let htmlContent = `
        <html>
        <head>
        <meta charset='utf-8'>
        <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
            h1 { color: #0f172a; font-size: 24pt; margin-bottom: 10px; }
            h2 { color: #0f172a; font-size: 18pt; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            p { margin-bottom: 15px; }
            ul { margin-bottom: 15px; }
            li { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
            th { background-color: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #e2e8f0; font-size: 10pt; }
            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 10pt; }
            img { max-width: 100%; height: auto; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .total-row { background-color: #f8fafc; font-weight: bold; }
            .header-logo { max-height: 60px; margin-bottom: 20px; }
        </style>
        </head>
        <body>
      `;

      // 1. Header & Logo
      if (logo) {
          htmlContent += `<img src="${logo}" class="header-logo" alt="Company Logo" /><br/>`;
      }
      htmlContent += `<h1>Proposal for ${analysis.clientName}</h1>`;
      htmlContent += `<p><strong>Project:</strong> ${analysis.projectTitle}</p>`;
      htmlContent += `<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><hr/>`;

      // 2. Sections
      sectionsOrder.forEach(section => {
          if (!state.activeSections[section.key]) return;

          // Special Handling for Pricing
          if (section.key === 'pricing') {
              htmlContent += `<h2>Investment Summary</h2>`;
              htmlContent += `
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Unit</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Unit Cost</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
              `;
              
              state.pricingItems.forEach(item => {
                  const desc = item.isOptional ? `${item.description} (Optional)` : item.description;
                  htmlContent += `
                    <tr>
                        <td>${desc}</td>
                        <td>${item.unit}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">$${item.unitCost.toLocaleString()}</td>
                        <td class="text-right">$${(item.quantity * item.unitCost).toLocaleString()}</td>
                    </tr>
                  `;
              });

              htmlContent += `
                    <tr class="total-row">
                        <td colspan="4" class="text-right">Total Investment</td>
                        <td class="text-right">$${baseTotal.toLocaleString()}</td>
                    </tr>
              `;

              if (withOptionals > baseTotal) {
                  htmlContent += `
                    <tr>
                        <td colspan="4" class="text-right" style="color: #64748b; font-size: 9pt;">Total including Optionals</td>
                        <td class="text-right" style="color: #64748b; font-size: 9pt;">$${withOptionals.toLocaleString()}</td>
                    </tr>
                  `;
              }
              
              htmlContent += `</tbody></table>`;
              return;
          }

          // Standard Blocks
          const blockIds = Array.isArray(section.id) ? section.id : [section.id];
          
          blockIds.forEach(blockId => {
              const block = BUILDING_BLOCKS.find(b => b.id === blockId);
              if (block) {
                  // Use custom content if available, else default
                  const finalContent = state.customContent[blockId] || block.content;

                  // Simple Markdown to HTML conversion for export
                  // Added image tag replacement for Base64 images
                  let contentHtml = finalContent
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    // More robust list matching:
                    // Matches * or - followed by **Key**: Value or **Key** - Value
                    .replace(/^\s*[\*\-]\s+\*\*(.*?)\*\*[:\s-]*(.*$)/gim, '<ul><li><strong>$1:</strong> $2</li></ul>') 
                    .replace(/^\s*\d+\.\s+\*\*(.*?)\*\*[:\s-]*(.*$)/gim, '<ol><li><strong>$1:</strong> $2</li></ol>')
                    // Fallback for simple lists
                    .replace(/^\s*[\*\-]\s+(.*$)/gim, '<ul><li>$1</li></ul>')
                    .replace(/^\s*\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>')
                    
                    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<br/><img src="$2" alt="$1" /><br/>') // Image handler
                    .replace(/\n/g, '<br/>')
                    // Cleanup consecutive lists
                    .replace(/<\/ul><br\/><ul>/g, '')
                    .replace(/<\/ol><br\/><ol>/g, '');

                  htmlContent += contentHtml;
              }
          });
      });

      htmlContent += `</body></html>`;
      return htmlContent;
  };

  const handleExportDoc = () => {
    const html = generateHtmlForExport();
    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Proposal_${analysis.clientName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-4">
             <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center space-x-1">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Editor</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <h2 className="text-lg font-semibold text-slate-800">Final Preview</h2>
        </div>
        <button 
            onClick={handleExportDoc}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-sm"
        >
            <FileDown className="w-4 h-4" />
            <span>Export to Doc</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl min-h-[800px] p-12 border border-slate-200 relative">
            
            {/* Letterhead Logo */}
            {logo && (
                <div className="mb-8 pb-8 border-b border-slate-100">
                    <img src={logo} alt="Company Logo" className="h-16 object-contain" />
                </div>
            )}

            {/* Render Preview Content */}
            <div className="prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Proposal for {analysis.clientName}</h1>
                <p className="text-xl text-slate-500 mb-8">{analysis.projectTitle}</p>
                
                {sectionsOrder.map((section, idx) => {
                    if (!state.activeSections[section.key]) return null;
                    
                    if (section.key === 'pricing') {
                        const { baseTotal, withOptionals } = getTotals();
                        return (
                            <div key="pricing" className="mb-10">
                                <hr className="my-8 border-slate-200" />
                                <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-4">Investment Summary</h2>
                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Cost</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {state.pricingItems.map((item) => (
                                                <tr key={item.id} className={item.isOptional ? 'bg-slate-50' : ''}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                        {item.description} {item.isOptional && <span className="text-slate-400 font-normal ml-2">(Optional)</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.unit}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{item.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">${item.unitCost.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold text-right">${(item.quantity * item.unitCost).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50 border-t-2 border-slate-200">
                                                <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-slate-800">Total Investment</td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">${baseTotal.toLocaleString()}</td>
                                            </tr>
                                            {withOptionals > baseTotal && (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={4} className="px-6 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total including Optionals</td>
                                                    <td className="px-6 py-2 text-right text-xs font-bold text-slate-500">${withOptionals.toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    }

                    const blockIds = Array.isArray(section.id) ? section.id : [section.id];
                    
                    return (
                        <div key={section.key}>
                            {blockIds.map((blockId, bIdx) => {
                                const block = BUILDING_BLOCKS.find(b => b.id === blockId);
                                if (!block) return null;
                                
                                // Use custom content if edited
                                const contentToRender = state.customContent[blockId] || block.content;

                                return (
                                    <div key={blockId} className="mb-10">
                                        <hr className="my-8 border-slate-200" />
                                        <div className="markdown-body font-serif text-lg leading-relaxed text-slate-800">
                                            <Markdown
                                                components={{
                                                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                                                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-4" {...props} />,
                                                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-800 mt-5 mb-3" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
                                                    ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                                                    strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                                                    img: ({node, ...props}) => <img className="max-w-full rounded-lg my-4 border border-slate-200" {...props} />,
                                                }}
                                            >
                                                {contentToRender}
                                            </Markdown>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
