import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../../theme';

const SLOT_START_MIN_HOUR = 8;
const SLOT_START_MAX_HOUR = 20;
const SLOT_DURATION_HOURS = 2;

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function toDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function clampTime(hour: number, minute: number): { hour: number; minute: number } {
  let h = hour;
  let m = minute;
  if (h < SLOT_START_MIN_HOUR) {
    h = SLOT_START_MIN_HOUR;
    m = 0;
  }
  if (h > SLOT_START_MAX_HOUR || (h === SLOT_START_MAX_HOUR && m > 0)) {
    h = SLOT_START_MAX_HOUR;
    m = 0;
  }
  // Snap minutes to 0 or 30 for cleaner slots (optional soft snap on confirm)
  if (m > 0 && m < 15) m = 0;
  else if (m >= 15 && m < 45) m = 30;
  else if (m >= 45) {
    m = 0;
    h = Math.min(h + 1, SLOT_START_MAX_HOUR);
    if (h === SLOT_START_MAX_HOUR) m = 0;
  }
  return { hour: h, minute: m };
}

function digitalParts(hour24: number, minute: number) {
  const h = hour24 % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    hh: pad2(h12),
    mm: pad2(minute),
    period,
    label: `${h12}:${pad2(minute)} ${period}`,
  };
}

function endFromStart(hour: number, minute: number) {
  const total = hour * 60 + minute + SLOT_DURATION_HOURS * 60;
  return {
    hour: Math.floor(total / 60) % 24,
    minute: total % 60,
  };
}

export function formatTwoHourSlot(hour: number, minute: number): string {
  const start = digitalParts(hour, minute);
  const end = endFromStart(hour, minute);
  const endP = digitalParts(end.hour, end.minute);
  return `${start.label} – ${endP.label}`;
}

interface Props {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

/**
 * Digital clock UI + native system time picker.
 * User picks start time; end is always +2 hours.
 */
export function DigitalClockPicker({ hour, minute, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [iosTemp, setIosTemp] = useState(() => toDate(hour, minute));

  const start = useMemo(() => digitalParts(hour, minute), [hour, minute]);
  const endRaw = useMemo(() => endFromStart(hour, minute), [hour, minute]);
  const end = useMemo(
    () => digitalParts(endRaw.hour, endRaw.minute),
    [endRaw.hour, endRaw.minute],
  );

  const applyTime = (date: Date) => {
    const clamped = clampTime(date.getHours(), date.getMinutes());
    onChange(clamped.hour, clamped.minute);
  };

  const openPicker = () => {
    setIosTemp(toDate(hour, minute));
    setShowPicker(true);
  };

  const onAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !date) return;
    applyTime(date);
  };

  const onIosChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setIosTemp(date);
  };

  const confirmIos = () => {
    applyTime(iosTemp);
    setShowPicker(false);
  };

  // Analog clock angles (12-hour face for start time)
  const h12 = hour % 12;
  const minuteAngle = (minute / 60) * 360;
  const hourAngle = (h12 / 12) * 360 + (minute / 60) * 30;

  return (
    <View>
      {/* Dual digital displays */}
      <Pressable onPress={openPicker} style={styles.digitalsRow}>
        <DigitalBlock
          title="START"
          hh={start.hh}
          mm={start.mm}
          period={start.period}
          accent
        />
        <View style={styles.arrowCol}>
          <Feather name="arrow-right" size={20} color={colors.primary.green600} />
          <Text style={styles.durationBadge}>2h</Text>
        </View>
        <DigitalBlock
          title="END"
          hh={end.hh}
          mm={end.mm}
          period={end.period}
        />
      </Pressable>

      {/* Analog face + CTA */}
      <Pressable onPress={openPicker} style={styles.analogWrap}>
        <View style={styles.analogFace}>
          {/* ticks */}
          {[0, 3, 6, 9].map((n) => (
            <Text
              key={n}
              style={[
                styles.tickNum,
                n === 0 && styles.tick12,
                n === 3 && styles.tick3,
                n === 6 && styles.tick6,
                n === 9 && styles.tick9,
              ]}
            >
              {n === 0 ? 12 : n}
            </Text>
          ))}
          <View
            style={[
              styles.handHour,
              {
                transform: [
                  { translateY: FACE * 0.14 },
                  { rotate: `${hourAngle}deg` },
                  { translateY: -FACE * 0.14 },
                ],
              },
            ]}
          />
          <View
            style={[
              styles.handMinute,
              {
                transform: [
                  { translateY: FACE * 0.19 },
                  { rotate: `${minuteAngle}deg` },
                  { translateY: -FACE * 0.19 },
                ],
              },
            ]}
          />
          <View style={styles.centerDot} />
        </View>

        <View style={styles.analogMeta}>
          <Text style={styles.slotTitle}>Your 2-hour slot</Text>
          <Text style={styles.slotRange}>
            {start.label} – {end.label}
          </Text>
          <View style={styles.tapRow}>
            <Feather name="clock" size={14} color={colors.primary.green600} />
            <Text style={styles.tapText}>Tap to open clock & set time</Text>
          </View>
        </View>
      </Pressable>

      <Pressable style={styles.openBtn} onPress={openPicker}>
        <Feather name="watch" size={18} color={colors.neutral.white} />
        <Text style={styles.openBtnText}>Open clock picker</Text>
      </Pressable>

      <Text style={styles.hint}>
        Available start: 8:00 AM – 8:00 PM · Duration fixed 2 hours
      </Text>

      {/* Android: system dialog */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={toDate(hour, minute)}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onAndroidChange}
        />
      )}

      {/* iOS / web: modal with spinner */}
      {showPicker && Platform.OS !== 'android' && (
        <Modal transparent animationType="slide" visible onRequestClose={() => setShowPicker(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowPicker(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set start time</Text>
            <Text style={styles.modalSub}>End time will be +2 hours automatically</Text>
            <DateTimePicker
              value={iosTemp}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onIosChange}
              style={styles.iosPicker}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShowPicker(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalOk} onPress={confirmIos}>
                <Text style={styles.modalOkText}>Set time</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function DigitalBlock({
  title,
  hh,
  mm,
  period,
  accent,
}: {
  title: string;
  hh: string;
  mm: string;
  period: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.digitalBlock, accent && styles.digitalBlockAccent]}>
      <Text style={styles.digitalTitle}>{title}</Text>
      <View style={styles.digitalFace}>
        <Text style={styles.digitalDigits}>
          {hh}
          <Text style={styles.digitalColon}>:</Text>
          {mm}
        </Text>
        <Text style={styles.digitalPeriod}>{period}</Text>
      </View>
    </View>
  );
}

const FACE = 120;

const styles = StyleSheet.create({
  digitalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  digitalBlock: {
    flex: 1,
    backgroundColor: '#0D1B12',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1B3D2A',
  },
  digitalBlockAccent: {
    borderColor: colors.primary.green500,
    shadowColor: colors.primary.green600,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  digitalTitle: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.primary.green200,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  digitalFace: {
    alignItems: 'center',
  },
  digitalDigits: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#7CFFB2',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  digitalColon: {
    color: '#4CAF50',
  },
  digitalPeriod: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary.green200,
    marginTop: 2,
  },
  arrowCol: {
    alignItems: 'center',
    gap: 4,
  },
  durationBadge: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: colors.primary.green700,
    backgroundColor: colors.primary.green50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },

  analogWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary.green50,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.primary.green100,
    marginBottom: spacing.md,
  },
  analogFace: {
    width: FACE,
    height: FACE,
    borderRadius: FACE / 2,
    backgroundColor: colors.neutral.white,
    borderWidth: 3,
    borderColor: colors.primary.green600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  tickNum: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.neutral.gray600,
  },
  tick12: { top: 8 },
  tick3: { right: 10 },
  tick6: { bottom: 8 },
  tick9: { left: 10 },
  handHour: {
    position: 'absolute',
    width: 4,
    height: FACE * 0.28,
    backgroundColor: colors.neutral.black,
    borderRadius: 2,
    top: FACE / 2 - FACE * 0.28,
    left: FACE / 2 - 2,
  },
  handMinute: {
    position: 'absolute',
    width: 2.5,
    height: FACE * 0.38,
    backgroundColor: colors.primary.green600,
    borderRadius: 2,
    top: FACE / 2 - FACE * 0.38,
    left: FACE / 2 - 1.25,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.green700,
    zIndex: 2,
  },
  analogMeta: { flex: 1 },
  slotTitle: {
    ...typography.caption,
    color: colors.neutral.gray600,
    fontWeight: '600' as const,
  },
  slotRange: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: colors.primary.green700,
    marginTop: 4,
    marginBottom: 8,
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapText: {
    ...typography.caption,
    color: colors.primary.green600,
    fontWeight: '600' as const,
  },

  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  openBtnText: {
    ...typography.buttonSm,
    color: colors.neutral.white,
  },
  hint: {
    ...typography.caption,
    color: colors.neutral.gray400,
    textAlign: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radii.xl + 4,
    borderTopRightRadius: radii.xl + 4,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.gray200,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.neutral.black,
    textAlign: 'center',
  },
  modalSub: {
    ...typography.caption,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  iosPicker: {
    alignSelf: 'center',
    height: 180,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    ...typography.buttonSm,
    color: colors.neutral.gray600,
  },
  modalOk: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primary.green600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOkText: {
    ...typography.buttonSm,
    color: colors.neutral.white,
  },
});
