import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, I18nManager, Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

type Place = { name: string; country?: string; latitude: number; longitude: number; admin1?: string };
type Daily = { date: string; code: number; max: number; min: number; rain: number };
const copy = {
  en: { search:"Search city, country or region", today:"TODAY", feels:"Feels like", humidity:"Humidity", wind:"Wind", uv:"UV index", week:"7-DAY FORECAST", saved:"YOUR PLACES", add:"Add place", empty:"Search for a place to get started.", remove:"Remove", updated:"Updated just now", weather:"Weather", clear:"Clear sky", partly:"Partly cloudy", cloudy:"Cloudy", rain:"Rain", snow:"Snow", storm:"Thunderstorm", sunrise:"Sunrise", sunset:"Sunset", pinned:"Saved places", noResults:"No places found" },
  fr: { search:"Ville, pays ou région", today:"AUJOURD’HUI", feels:"Ressenti", humidity:"Humidité", wind:"Vent", uv:"Indice UV", week:"PRÉVISIONS SUR 7 JOURS", saved:"VOS LIEUX", add:"Ajouter", empty:"Recherchez un lieu pour commencer.", remove:"Retirer", updated:"Mis à jour à l’instant", weather:"Météo", clear:"Ciel dégagé", partly:"Partiellement nuageux", cloudy:"Nuageux", rain:"Pluie", snow:"Neige", storm:"Orage", sunrise:"Lever du soleil", sunset:"Coucher du soleil", pinned:"Lieux enregistrés", noResults:"Aucun lieu trouvé" },
  ar: { search:"ابحث عن مدينة أو دولة أو منطقة", today:"اليوم", feels:"المحسوسة", humidity:"الرطوبة", wind:"الرياح", uv:"مؤشر الأشعة", week:"توقعات ٧ أيام", saved:"أماكنك", add:"إضافة مكان", empty:"ابحث عن مكان للبدء.", remove:"إزالة", updated:"تم التحديث الآن", weather:"الطقس", clear:"سماء صافية", partly:"غائم جزئياً", cloudy:"غائم", rain:"مطر", snow:"ثلج", storm:"عاصفة رعدية", sunrise:"الشروق", sunset:"الغروب", pinned:"الأماكن المحفوظة", noResults:"لم يتم العثور على أماكن" }
};
function label(code:number, t:any) {
  if ([0].includes(code)) return t.clear;
  if ([1,2].includes(code)) return t.partly;
  if ([3,45,48].includes(code)) return t.cloudy;
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return t.rain;
  if ([71,73,75,77,85,86].includes(code)) return t.snow;
  return t.storm;
}
function icon(code:number, night:boolean) {
  if ([0].includes(code)) return night ? "moon" : "sunny";
  if ([1,2].includes(code)) return night ? "cloudy-night" : "partly-sunny";
  if ([3,45,48].includes(code)) return "cloud";
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return "rainy";
  if ([71,73,75,77,85,86].includes(code)) return "snow";
  return "thunderstorm";
}
const geoCache = new Map<string, Place[]>();
async function geocode(q:string, signal?:AbortSignal):Promise<Place[]> {
  const key = q.toLowerCase();
  const hit = geoCache.get(key);
  if (hit) return hit;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
  const r = await fetch(url, { signal }); const j = await r.json();
  const list:Place[] = (j.results || []).map((p:any)=>({name:p.name,country:p.country,latitude:p.latitude,longitude:p.longitude,admin1:p.admin1}));
  geoCache.set(key, list);
  return list;
}
async function getWeather(p:Place) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`;
  const r = await fetch(url); if (!r.ok) throw new Error("Weather unavailable"); return r.json();
}
export default function Home() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const [lang,setLang] = useState<"en"|"fr"|"ar">("en");
  const [query,setQuery] = useState("Algiers");
  const [place,setPlace] = useState<Place>({name:"Algiers",country:"Algeria",latitude:36.7538,longitude:3.0588});
  const [results,setResults] = useState<Place[]>([]);
  const [weather,setWeather] = useState<any>(null);
  const [saved,setSaved] = useState<Place[]>([]);
  const [loading,setLoading] = useState(false);
  const [searching,setSearching] = useState(false);
  const [typing,setTyping] = useState(false);
  const [error,setError] = useState("");
  const t = copy[lang];
  const palette = dark ? ["#101B45","#263C78","#415F9C"] : (new Date().getHours() < 12 ? ["#2677E8","#57B6F7","#9DDDFB"] : new Date().getHours() < 17 ? ["#FF9D6C","#F7B98A","#FFD7A4"] : ["#4A55B8","#8A77D9","#F6A7B8"]);
  useEffect(()=>{ load(place); },[]);
  useEffect(()=>{
    if(!typing) return;
    const q = query.trim();
    if(q.length<2){ setResults([]); setSearching(false); return; }
    const ctrl = new AbortController();
    setSearching(true);
    const id = setTimeout(async()=>{
      try { const found=await geocode(q,ctrl.signal); setResults(found); setError(found.length?"":t.noResults); }
      catch(e:any) { if(e?.name!=="AbortError") setError("Search failed. Please try again."); }
      finally { if(!ctrl.signal.aborted) setSearching(false); }
    },180);
    return ()=>{ clearTimeout(id); ctrl.abort(); };
  },[query,typing]);
  async function load(p:Place) { setLoading(true); setError(""); try { const data=await getWeather(p); setWeather(data); setPlace(p); setQuery(p.name); } catch(e) { setError("Could not load weather. Check your connection and try again."); } finally { setLoading(false); } }
  async function search() { const q=query.trim(); if(!q) return; setSearching(true); try { const found=await geocode(q); if(found.length===1) { setTyping(false); setResults([]); await load(found[0]); } else { setResults(found); setError(found.length?"":t.noResults); } } catch(e) { setError("Search failed. Please try again."); } finally { setSearching(false); } }
  function pick(p:Place) { Keyboard.dismiss(); setTyping(false); setResults([]); load(p); }
  function toggleSave(p:Place) { setSaved(prev=>prev.some(x=>x.latitude===p.latitude&&x.longitude===p.longitude)?prev.filter(x=>!(x.latitude===p.latitude&&x.longitude===p.longitude)):[p,...prev]); }
  const isSaved = saved.some(x=>x.latitude===place.latitude&&x.longitude===place.longitude);
  const days:Daily[] = useMemo(()=>weather?.daily?.time?.map((date:string,i:number)=>({date,code:weather.daily.weather_code[i],max:Math.round(weather.daily.temperature_2m_max[i]),min:Math.round(weather.daily.temperature_2m_min[i]),rain:weather.daily.precipitation_probability_max?.[i]||0}))||[],[weather]);
  return <View className="flex-1 bg-[#1c4f8d] dark:bg-[#0B1224]">
    <LinearGradient colors={palette as any} className="absolute left-0 right-0 top-0 h-[560px]" />
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:36}}>
      <View className="px-5 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-11 w-11 rounded-2xl bg-white/20 items-center justify-center border border-white/30"><Ionicons name="cloud" size={27} color="white" /></View>
            <View className="ml-3"><Text className="text-white text-2xl font-extrabold tracking-tight">WeatherMe</Text><Text className="text-white/75 text-xs">{t.updated}</Text></View>
          </View>
          <View className="flex-row items-center">
            <Pressable onPress={toggleColorScheme} className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/25"><Ionicons name={dark?"sunny":"moon"} size={19} color="white" /></Pressable>
            <View className="flex-row rounded-full bg-white/20 p-1 border border-white/25">
              {(["en","fr","ar"] as const).map(l=><Pressable key={l} onPress={()=>setLang(l)} className={`px-3 py-2 rounded-full ${lang===l?"bg-white":"bg-transparent"}`}><Text className={`text-xs font-bold ${lang===l?"text-[#3478F6]":"text-white"}`}>{l.toUpperCase()}</Text></Pressable>)}
            </View>
          </View>
        </View>
        <View className="mt-7 flex-row items-center rounded-2xl bg-white/95 dark:bg-[#18233F]/95 px-4 py-1 shadow-lg">
          <Ionicons name="search" size={20} color="#8292AA" />
          <TextInput value={query} onChangeText={v=>{setQuery(v);setTyping(true);setError("")}} onSubmitEditing={search} returnKeyType="search" autoCorrect={false} placeholder={t.search} placeholderTextColor={dark?"#7C8BA6":"#93A1B5"} className="flex-1 px-3 py-3.5 text-[#15233D] dark:text-white text-sm" />
          <Pressable onPress={search} className="rounded-xl bg-[#3478F6] p-2.5">{searching?<ActivityIndicator size="small" color="white"/>:<Ionicons name="arrow-forward" size={18} color="white" />}</Pressable>
        </View>
        {results.length>0&&<View className="mt-2 rounded-2xl bg-white dark:bg-[#18233F] p-2 shadow-xl">{results.map((p,i)=><Pressable key={`${p.name}${i}`} onPress={()=>pick(p)} className="flex-row items-center border-b border-slate-100 dark:border-slate-700 px-3 py-3"><Ionicons name="location-outline" size={18} color="#3478F6"/><View className="ml-3 flex-1"><Text className="font-bold text-[#15233D] dark:text-white">{p.name}</Text><Text className="text-xs text-slate-500 dark:text-slate-400">{[p.admin1,p.country].filter(Boolean).join(", ")}</Text></View><Ionicons name="chevron-forward" size={17} color="#94A3B8"/></Pressable>)}</View>}
        <View className="mt-8 flex-row items-center justify-center"><Ionicons name="location-sharp" size={15} color="white"/><Text className="ml-1 text-white font-semibold">{place.name}{place.country?`, ${place.country}`:""}</Text><Pressable onPress={()=>toggleSave(place)} className="ml-3 rounded-full bg-white/20 p-2"><Ionicons name={isSaved?"bookmark":"bookmark-outline"} size={17} color="white"/></Pressable></View>
        <Text className="mt-5 text-center text-xs font-bold tracking-[3px] text-white/75">{t.today}</Text>
        <View className="mt-2 items-center">
          {loading&&!weather ? <ActivityIndicator size="large" color="white"/> : <Ionicons name={icon(weather?.current?.weather_code??0,dark) as any} size={82} color="white" />}
          <Text className="mt-1 text-white text-[76px] leading-[88px] font-light">{weather?Math.round(weather.current.temperature_2m):"—"}°</Text>
          <Text className="mt-1 text-white text-xl font-semibold">{weather?label(weather.current.weather_code,t):t.weather}</Text>
          <Text className="mt-2 text-white/80 text-sm">{weather?`${t.feels} ${Math.round(weather.current.apparent_temperature)}°`:"Connect to load live weather"}</Text>
        </View>
        <View className="mt-7 flex-row rounded-3xl bg-white/20 border border-white/25 px-2 py-4">
          {[[ "water-outline",t.humidity,weather?`${weather.current.relative_humidity_2m}%`:"—"],["navigate-outline",t.wind,weather?`${Math.round(weather.current.wind_speed_10m)} km/h`:"—"],["sunny-outline",t.uv,weather?`${Math.round(weather.daily.uv_index_max[0])}`:"—"]].map((x:any,i)=><View key={i} className={`flex-1 items-center ${i>0?"border-l border-white/20":""}`}><Ionicons name={x[0]} size={20} color="white"/><Text className="mt-2 text-xs text-white/75">{x[1]}</Text><Text className="mt-1 text-white font-bold">{x[2]}</Text></View>)}
        </View>
        {error!==""&&<Text className="mt-3 text-center text-white font-medium">{error}</Text>}
      </View>
      <View className="mt-8 rounded-t-[34px] bg-[#F3F7FC] dark:bg-[#0B1224] px-5 pt-7">
        <View className="flex-row items-center justify-between"><Text className="text-[#15233D] dark:text-white text-base font-extrabold">{t.week}</Text><View className="rounded-full bg-blue-50 dark:bg-[#22325C] px-3 py-1"><Text className="text-[#3478F6] dark:text-[#8DB4FF] text-xs font-bold">7 DAYS</Text></View></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{gap:10}}>
          {days.map((d,i)=><View key={d.date} className={`w-[91px] items-center rounded-2xl px-2 py-4 ${i===0?"bg-[#3478F6]":"bg-white dark:bg-[#18233F]"} shadow-sm`}>
            <Text className={`text-xs font-bold ${i===0?"text-white":"text-slate-500 dark:text-slate-400"}`}>{i===0?"Today":new Date(d.date+"T12:00:00").toLocaleDateString(lang==="fr"?"fr-FR":lang==="ar"?"ar":"en-US",{weekday:"short"})}</Text>
            <Ionicons name={icon(d.code,false) as any} size={26} color={i===0?"white":dark?"#8DB4FF":"#3478F6"} style={{marginTop:13,marginBottom:11}}/>
            <Text className={`font-extrabold text-base ${i===0?"text-white":"text-[#15233D] dark:text-white"}`}>{d.max}°</Text><Text className={`mt-1 text-xs ${i===0?"text-white/70":"text-slate-400"}`}>{d.min}°</Text>
            <View className="mt-3 flex-row items-center"><Ionicons name="water" size={11} color={i===0?"#DDEBFF":"#60A5FA"}/><Text className={`ml-1 text-[10px] ${i===0?"text-white/80":"text-slate-400"}`}>{d.rain}%</Text></View>
          </View>)}
        </ScrollView>
        <View className="mt-7 flex-row items-center justify-between"><Text className="text-[#15233D] dark:text-white text-base font-extrabold">{t.saved}</Text><Text className="text-xs text-slate-400">{saved.length} {saved.length===1?"place":"places"}</Text></View>
        {saved.length===0?<View className="mt-3 flex-row items-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-[#18233F]/70 p-4"><View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-[#22325C]"><Ionicons name="bookmark-outline" size={21} color={dark?"#8DB4FF":"#3478F6"}/></View><View className="ml-3 flex-1"><Text className="font-bold text-[#15233D] dark:text-white">{t.pinned}</Text><Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.empty}</Text></View></View>:saved.map(p=><View key={`${p.latitude}-${p.longitude}`} className="mt-3 flex-row items-center rounded-2xl bg-white dark:bg-[#18233F] p-4 shadow-sm"><Pressable onPress={()=>load(p)} className="flex-1 flex-row items-center"><View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-[#22325C]"><Ionicons name="cloud" size={22} color={dark?"#8DB4FF":"#3478F6"}/></View><View className="ml-3"><Text className="font-bold text-[#15233D] dark:text-white">{p.name}</Text><Text className="mt-1 text-xs text-slate-400">{p.country||p.admin1||"Saved location"}</Text></View></Pressable><Pressable onPress={()=>toggleSave(p)} className="rounded-xl bg-rose-50 dark:bg-[#3A1F2B] p-2.5"><Ionicons name="trash-outline" size={17} color="#E05267"/></Pressable></View>)}
        <View className="mt-7 mb-2 items-center rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/70 dark:bg-[#18233F]/70 px-4 py-4">
          <View className="flex-row items-center"><Ionicons name="cloud" size={16} color={dark?"#8DB4FF":"#3478F6"}/><Text className="ml-2 text-sm font-extrabold text-[#15233D] dark:text-white">WeatherMe</Text></View>
          <Text className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Created by Hichem Bendali</Text>
          <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">hichembendali08@gmail.com</Text>
          <Text className="mt-2 text-center text-[10px] text-slate-400">© {new Date().getFullYear()} Hichem Bendali. All rights reserved.</Text>
          <Text className="mt-1 text-[10px] text-slate-300 dark:text-slate-500">Live weather data by Open-Meteo</Text>
        </View>
      </View>
    </ScrollView>
  </View>;
}