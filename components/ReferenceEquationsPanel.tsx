import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 mb-2">{title}</h4>
        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-inner space-y-3">
            {children}
        </div>
    </div>
);

const Equation: React.FC<{ formula: React.ReactNode; description: string }> = ({ formula, description }) => (
    <div className="py-2 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
        <code className="block text-center text-sm font-mono bg-gray-100 dark:bg-slate-900/50 p-2 rounded-md text-indigo-600 dark:text-indigo-300">{formula}</code>
        <p className="mt-2 text-xs text-gray-600 dark:text-slate-300">{description}</p>
    </div>
);

const ReferenceEquationsPanel: React.FC = () => {
    return (
        <div className="space-y-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-4">
                Reference Equations & Models
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Fluid Dynamics & Pressure Drop">
                     <Equation 
                        formula={<>Re = (ρ * v * D) / μ</>}
                        description="Reynolds Number (Re) determines the flow regime (laminar vs. turbulent) based on fluid density (ρ), velocity (v), pipe diameter (D), and viscosity (μ)."
                    />
                     <Equation 
                        formula={<>f = (1 / (-1.8 * log₁₀((ε/D/3.7)¹·¹¹ + 6.9/Re)))²</>}
                        description="The Haaland equation provides the Darcy friction factor (f) for turbulent flow, accounting for relative pipe roughness (ε/D) and Reynolds number."
                    />
                    <Equation 
                        formula={<>ΔP = f * (L/D) * (ρ * v²/2)</>}
                        description="The Darcy-Weisbach equation calculates the pressure drop (ΔP) over a pipe segment of length (L) and diameter (D)."
                    />
                </Section>
                
                <Section title="Heat Transfer">
                    <Equation 
                        formula={<>Nu = 0.023 * Re⁰·⁸ * Pr⁰·⁴</>}
                        description="The Dittus-Boelter correlation calculates the Nusselt number (Nu) for turbulent flow inside pipes, which is used to find the internal convection coefficient."
                    />
                    <Equation 
                        formula={<>Q_conv_ext = h_ext * A * (T_amb - T_surf)</>}
                        description="External convective heat ingress (Q) is calculated using the external convection coefficient (h_ext), surface area (A), and temperature difference."
                    />
                    <Equation 
                        formula={<>Q_rad_ext = ε * σ * A * (T_amb⁴ - T_surf⁴)</>}
                        description="External radiative heat ingress (Q) is calculated using the surface emissivity (ε), Stefan-Boltzmann constant (σ), area (A), and the difference of absolute temperatures to the fourth power."
                    />
                     <Equation 
                        formula={<>Q_removed = ṁ * Cₚ * (T_out - T_in)</>}
                        description="Heat removed by the N₂ is a function of its mass flow rate (ṁ), specific heat (Cₚ), and the temperature change across a pipe segment."
                    />
                </Section>
                
                <Section title="Material & Gas Properties">
                     <Equation 
                        formula={<>Cₚ_SS304 = f(T)</>}
                        description="The specific heat (Cₚ) of SS304 steel is temperature-dependent and is calculated using an empirical formula."
                    />
                    <Equation 
                        formula={<>ρ_N₂ = (P * M) / (R * T)</>}
                        description="The density (ρ) of N₂ gas is calculated using the Ideal Gas Law, based on pressure (P), molar mass (M), the ideal gas constant (R), and absolute temperature (T)."
                    />
                     <Equation 
                        formula={<>μ_N₂ = f(T)</>}
                        description="The dynamic viscosity (μ) of N₂ gas is calculated using Sutherland's Law, which models its temperature dependency."
                    />
                </Section>

                <Section title="Core Simulation Model">
                    <Equation 
                        formula={<>ΔT_pipe = (Q_net * Δt) / (m * Cₚ)</>}
                        description="The fundamental energy balance. The change in a pipe segment's temperature (ΔT) over a time step (Δt) is the net heat flow (Q_net = Q_ingress - Q_removed) divided by its thermal mass (mass * specific heat)."
                    />
                </Section>
            </div>
        </div>
    );
};

export default ReferenceEquationsPanel;