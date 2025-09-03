"use client";
import React from 'react';

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

type ControlledProps = {
  values?: any;
  errors?: any;
  onChange?: (name: string, value: any) => void;
};

type HookProps = {
  register?: any;
  errors?: any;
};

type Props = {
  title?: string;
} & (ControlledProps | HookProps);

export default function AddressForm(props: Props) {
  const { title } = props as any;
  const isHook = Boolean((props as HookProps).register);

  if (isHook) {
    const { register, errors } = props as HookProps;
    return (
      <div className="mb-4 space-y-3 sm:space-y-4 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-lg">
        {title ? <h4 className="font-bold text-sm sm:text-base text-blue-700 mb-3">{title}</h4> : null}
        <div>
          <label className="block font-bold mb-2 text-sm text-black">Street Address <span className="text-red-500">*</span></label>
          <input {...register('street', { required: 'Street address is required' })} className={`w-full px-4 py-3 rounded-lg border ${errors?.street ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="Street address" />
          {errors?.street && <div className="text-red-500 text-xs mt-1">{errors.street.message}</div>}
        </div>
        <div>
          <label className="block font-bold mb-2 text-sm text-black">City / Area <span className="text-red-500">*</span></label>
          <input {...register('area', { required: 'City / Area is required' })} className={`w-full px-4 py-3 rounded-lg border ${errors?.area ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="City / Area" />
          {errors?.area && <div className="text-red-500 text-xs mt-1">{errors.area.message}</div>}
        </div>
        <div>
          <label className="block font-bold mb-2 text-sm text-black">Landmark (Optional)</label>
          <input {...register('landmark')} className={`w-full px-4 py-3 rounded-lg border ${errors?.landmark ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="Landmark (e.g. near Unity Church)" />
          {errors?.landmark && <div className="text-red-500 text-xs mt-1">{errors.landmark.message}</div>}
        </div>
        <div>
          <label className="block font-bold mb-2 text-sm text-black">State / Region <span className="text-red-500">*</span></label>
          <input {...register('region', { required: 'State/Region is required' })} className={`w-full px-4 py-3 rounded-lg border ${errors?.region ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="State / Region" />
          {errors?.region && <div className="text-red-500 text-xs mt-1">{errors.region.message}</div>}
        </div>
        <div>
          <label className="block font-bold mb-2 text-sm text-black">Postal Code (Optional)</label>
          <input {...register('postalCode')} placeholder="Postal Code (optional)" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-sm text-black">Country <span className="text-red-500">*</span></label>
          <input {...register('country')} defaultValue={'Nigeria'} className={`w-full px-4 py-3 rounded-lg border ${errors?.country ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="Country" />
          {errors?.country && <div className="text-red-500 text-xs mt-1">{errors.country.message}</div>}
        </div>
      </div>
    );
  }

  const { values = {}, errors = {}, onChange } = props as ControlledProps;
  const set = (name: string, value: any) => {
    if (onChange) onChange(name, value);
  };

  return (
    <div className="mb-4 space-y-3 sm:space-y-4 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-lg">
      {title ? <h4 className="font-bold text-sm sm:text-base text-blue-700 mb-3">{title}</h4> : null}
      <div>
        <label className="block font-bold mb-2 text-sm text-black">Street Address <span className="text-red-500">*</span></label>
        <input name="shippingAddress.street" value={values?.street || ''} onChange={(e) => set('shippingAddress.' + 'street', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors?.street ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="Enter your street address" />
        {errors?.street && <div className="text-red-500 text-xs mt-1">{errors.street}</div>}
      </div>
      <div>
        <label className="block font-bold mb-2 text-sm text-black">City <span className="text-red-500">*</span></label>
        <input name="shippingAddress.city" value={values?.city || ''} onChange={(e) => set('shippingAddress.' + 'city', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors?.city ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="Enter your city" />
        {errors?.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
      </div>
      <div>
        <label className="block font-bold mb-2 text-sm text-black">State <span className="text-red-500">*</span></label>
        <select name="shippingAddress.state" value={values?.state || ''} onChange={(e) => set('shippingAddress.' + 'state', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors?.state ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`}>
          <option value="">Choose your state</option>
          {nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors?.state && <div className="text-red-500 text-xs mt-1">{errors.state}</div>}
      </div>
      <div>
        <label className="block font-bold mb-2 text-sm text-black">Postal Code (Optional)</label>
        <input name="shippingAddress.postalCode" value={values?.postalCode || ''} onChange={(e) => set('shippingAddress.' + 'postalCode', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold" placeholder="Enter postal code (optional)" />
      </div>
      <div>
        <label className="block font-bold mb-2 text-sm text-black">Country <span className="text-red-500">*</span></label>
        <input name="shippingAddress.country" value={values?.country || 'Nigeria'} onChange={(e) => set('shippingAddress.' + 'country', e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${errors?.country ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`} placeholder="Country" />
        {errors?.country && <div className="text-red-500 text-xs mt-1">{errors.country}</div>}
      </div>
    </div>
  );
}
