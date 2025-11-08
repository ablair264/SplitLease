import bpy, json, argparse, os

def set_car_paint(color_hex: str):
    r = int(color_hex[1:3], 16)/255
    g = int(color_hex[3:5], 16)/255
    b = int(color_hex[5:7], 16)/255
    for m in bpy.data.materials:
        if m and m.use_nodes and m.name.startswith('PAINT'):
            bsdf = m.node_tree.nodes.get('Principled BSDF')
            if bsdf:
                bsdf.inputs['Base Color'].default_value = (r, g, b, 1)
                bsdf.inputs['Clearcoat'].default_value = 0.2
                bsdf.inputs['Clearcoat Roughness'].default_value = 0.1

def set_wheels(variant: str):
    coll = bpy.data.collections.get('WHEELS')
    if not coll:
        # fallback: hide all wheel objects not matching variant
        for obj in bpy.data.objects:
            if obj.name.startswith('WHEELS_'):
                obj.hide_render = (variant not in obj.name)
        return
    for obj in coll.objects:
        obj.hide_render = (variant not in obj.name)

def set_engine(engine='BLENDER_EEVEE', samples=64):
    s = bpy.context.scene
    if engine == 'CYCLES':
        s.render.engine = 'CYCLES'
        s.cycles.samples = samples
        s.cycles.use_denoising = True
        s.cycles.feature_set = 'SUPPORTED'
        s.cycles.use_adaptive_sampling = True
    else:
        s.render.engine = 'BLENDER_EEVEE'
        s.eevee.taa_render_samples = samples

def render_angle(cam_name: str, outpath: str, res=(2048, 1152), fmt='PNG', alpha=True):
    cam = bpy.data.objects.get(cam_name)
    if not cam:
        raise RuntimeError(f'Camera not found: {cam_name}')
    bpy.context.scene.camera = cam
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = res
    s.render.image_settings.file_format = fmt
    s.render.image_settings.color_mode = 'RGBA' if alpha else 'RGB'
    s.render.filepath = outpath
    os.makedirs(os.path.dirname(outpath), exist_ok=True)
    bpy.ops.render.render(write_still=True)

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--config', required=True)
    p.add_argument('--engine', default='BLENDER_EEVEE')
    p.add_argument('--samples', type=int, default=64)
    p.add_argument('--width', type=int, default=2048)
    p.add_argument('--height', type=int, default=1152)
    args = p.parse_args()

    cfg = json.load(open(args.config))
    set_engine(args.engine, args.samples)

    for v in cfg['variants']:
        set_car_paint(v.get('color', '#ffffff'))
        if v.get('wheels'):
            set_wheels(v['wheels'])
        for cam in cfg['angles']:
            out = os.path.join(cfg['out_dir'], f"{v['slug']}_{cam}.png")
            render_angle(cam, out, res=(args.width, args.height))

